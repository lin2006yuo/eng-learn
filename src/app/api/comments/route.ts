import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { articles } from '@/lib/db/articles-schema';
import { commentAnchors, comments, notifications, patterns } from '@/lib/db/patterns-schema';
import { users } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import {
  fetchCommentsByRoot,
  fetchCommentsByUser,
  fetchReplies,
  fetchLikesInfo,
  fetchCurrentUserLikes,
  fetchReplyCounts,
  validateTargetExists,
  countCommentsByUser,
} from '@/features/comment/queries';
import { buildNestedComments, buildFlatComments } from '@/features/comment/transformers';
import type { CreateCommentAnchorRequest, RootType } from '@/features/comment/types';

function generateId(): string {
  return `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateAnchorId(): string {
  return `ca-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function parseQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return {
    rootType: searchParams.get('rootType') as RootType | null,
    rootId: searchParams.get('rootId'),
    userId: searchParams.get('userId'),
    cursor: searchParams.get('cursor'),
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 50),
    sort: (searchParams.get('sort') || 'newest') as 'newest' | 'hottest',
  };
}

function fetchPatternContext(rootType: RootType, rootId: string) {
  if (rootType !== 'pattern') return Promise.resolve(undefined);
  const db = getDb();
  return db
    .select({ id: patterns.id, title: patterns.title, emoji: patterns.emoji })
    .from(patterns)
    .where(eq(patterns.id, rootId))
    .limit(1)
    .then(rows => rows[0]);
}

function fetchArticleContext(rootType: RootType, rootId: string) {
  if (rootType !== 'article') return Promise.resolve(undefined);
  const db = getDb();
  return db
    .select({ id: articles.id, title: articles.title, status: articles.status })
    .from(articles)
    .where(eq(articles.id, rootId))
    .limit(1)
    .then(rows => rows[0]);
}

async function validateRootAccess(rootType: RootType, rootId: string) {
  if (rootType === 'pattern') {
    const pattern = await fetchPatternContext(rootType, rootId);
    return { valid: !!pattern, context: pattern };
  }
  if (rootType === 'article') {
    const article = await fetchArticleContext(rootType, rootId);
    return {
      valid: !!article && article.status === 'published',
      context: article,
    };
  }
  return { valid: true, context: undefined };
}

function determineQueryMode(params: {
  rootType: RootType | null;
  rootId: string | null;
  userId: string | null;
}): 'byRoot' | 'byUser' {
  if (params.rootType && params.rootId) return 'byRoot';
  if (params.userId) return 'byUser';
  throw new Error('Missing required parameter');
}

function validateParams(params: {
  rootType: RootType | null;
  rootId: string | null;
  userId: string | null;
}) {
  const rootParams = params.rootType && params.rootId ? 1 : 0;
  const userIdParam = params.userId ? 1 : 0;
  const activeParams = rootParams + userIdParam;

  if (activeParams === 0) {
    return { valid: false, error: 'rootType+rootId / userId 至少传一组' };
  }
  if (activeParams > 1) {
    return { valid: false, error: 'rootType+rootId / userId 只能传一组' };
  }
  if ((params.rootType && !params.rootId) || (!params.rootType && params.rootId)) {
    return { valid: false, error: 'rootType 和 rootId 必须同时传' };
  }
  return { valid: true };
}

function validateAnchor(
  anchor: CreateCommentAnchorRequest | undefined,
  rootType: RootType,
  rootId: string,
) {
  if (!anchor) return { valid: true };

  const hasText = anchor.selectedText.trim().length > 0;
  const hasBlock = anchor.blockId.trim().length > 0;
  const offsetsValid = anchor.startOffset >= 0 && anchor.endOffset > anchor.startOffset;
  const rootMatched = anchor.rootType === rootType && anchor.rootId === rootId;

  if (!hasText || !hasBlock || !offsetsValid || !rootMatched) {
    return { valid: false, error: '锚点参数错误' };
  }

  return { valid: true };
}

/**
 * GET /api/comments
 *
 * Query modes (mutually exclusive):
 * - `?rootType=<type>&rootId=<id>`  按根资源查询 (句型/文章等)
 * - `?userId=<uid>`                 按用户查询其全部评论
 *
 * Optional params:
 * - `cursor`    ISO 时间游标, 分页用
 * - `limit`     每页条数, 1-50, 默认 20
 * - `sort`      排序方式 newest|hottest, 默认 newest
 *
 * Response (byRoot):
 * - `data`          Comment[] 嵌套结构 (根评论 + replies)
 * - `patternInfo`   根句型上下文 { id, title, emoji }, rootType=pattern 时返回
 * - `totalCount`    根评论数
 * - `hasMore`       是否有更多
 * - `nextCursor`    下一页游标
 *
 * Response (byUser):
 * - `data`            Comment[] 平铺结构
 * - `patternInfoMap`  涉及的句型信息映射 { [patternId]: { id, title, emoji } }
 * - `totalCount`      评论总数
 * - `hasMore`         是否有更多
 * - `nextCursor`      下一页游标
 */
export async function GET(request: NextRequest) {
  const params = parseQueryParams(request);

  const validation = validateParams(params);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  const currentUserId = session?.user?.id || null;

  const mode = determineQueryMode(params);

  if (mode === 'byRoot') {
    const rootAccess = await validateRootAccess(params.rootType!, params.rootId!);
    if (!rootAccess.valid) {
      return NextResponse.json({ error: '根资源不存在或不可访问' }, { status: 404 });
    }

    const [{ comments: mainComments, hasMore, nextCursor }] = await Promise.all([
      fetchCommentsByRoot(params.rootType!, params.rootId!, params.cursor || undefined, params.limit),
    ]);

    if (mainComments.length === 0) {
      return NextResponse.json({ data: [], totalCount: 0, hasMore: false, nextCursor: undefined, rootInfo: rootAccess.context });
    }

    const commentIds = mainComments.map(c => c.id);

    const replies = await fetchReplies(params.rootType!, params.rootId!);
    const allCommentIds = [...commentIds, ...replies.map(r => r.id)];

    const { likesCountMap } = await fetchLikesInfo(allCommentIds);
    const likedByCurrentUserMap = await fetchCurrentUserLikes(allCommentIds, currentUserId);

    const replyCountByRoot = await fetchReplyCounts(commentIds);

    const data = buildNestedComments(
      mainComments,
      replies,
      likesCountMap,
      likedByCurrentUserMap,
      replyCountByRoot,
    );

    return NextResponse.json({ data, totalCount: mainComments.length, hasMore, nextCursor, rootInfo: rootAccess.context });
  }

  if (mode === 'byUser') {
    const { comments: userComments, hasMore, nextCursor } = await fetchCommentsByUser(
      params.userId!,
      params.cursor || undefined,
      params.limit,
    );

    if (userComments.length === 0) {
      return NextResponse.json({ data: [], totalCount: 0, hasMore: false, nextCursor: undefined });
    }

    const commentIds = userComments.map(c => c.id);
    const { likesCountMap } = await fetchLikesInfo(commentIds);
    const likedByCurrentUserMap = await fetchCurrentUserLikes(commentIds, currentUserId);

    const patternRootIds = [...new Set(userComments.map(c => c.rootId).filter(id => id.startsWith('pattern-')))];
    let patternInfoMap: Map<string, { id: string; title: string; emoji: string }> = new Map();
    if (patternRootIds.length > 0) {
      const db = getDb();
      const patternRows = await db
        .select({ id: patterns.id, title: patterns.title, emoji: patterns.emoji })
        .from(patterns)
        .where(inArray(patterns.id, patternRootIds));
      patternInfoMap = new Map(patternRows.map(p => [p.id, p]));
    }

    const data = buildFlatComments(userComments, likesCountMap, likedByCurrentUserMap);

    return NextResponse.json({
      data,
      totalCount: userComments.length,
      hasMore,
      nextCursor,
      patternInfoMap: Object.fromEntries(patternInfoMap),
    });
  }

  return NextResponse.json({ error: '不支持的查询模式' }, { status: 400 });
}

/**
 * POST /api/comments
 *
 * Auth: 需要登录
 *
 * Body:
 * - `targetType`     目标类型 pattern|comment
 * - `targetId`       目标 ID (句型ID 或 父评论ID)
 * - `rootType`       根资源类型 pattern|article|post|note
 * - `rootId`         根资源 ID
 * - `content`        评论内容, 1-300 字符
 * - `replyToUserId`  可选, 指定被回复者用户 ID (默认取父评论作者)
 *
 * Side effects:
 * - targetType=comment 时自动给被回复者创建通知
 *
 * Response:
 * - `data`  创建的评论对象 (含 replyToUserName)
 */
export async function POST(request: NextRequest) {
  const db = getDb();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const body = await request.json();
  const { targetType, targetId, rootType, rootId, content, replyToUserId, anchor } = body;

  if (!targetType || !targetId || !rootType || !rootId || !content || typeof content !== 'string') {
    return NextResponse.json({ error: '参数错误' }, { status: 400 });
  }

  const trimmedContent = content.trim();
  if (trimmedContent.length === 0 || trimmedContent.length > 300) {
    return NextResponse.json({ error: '评论内容长度必须在1-300之间' }, { status: 400 });
  }

  const anchorValidation = validateAnchor(anchor, rootType, rootId);
  if (!anchorValidation.valid) {
    return NextResponse.json({ error: anchorValidation.error }, { status: 400 });
  }

  const targetExists = await validateTargetExists(targetType, targetId);
  if (!targetExists) {
    return NextResponse.json({ error: '目标不存在' }, { status: 400 });
  }

  const rootAccess = await validateRootAccess(rootType, rootId);
  if (!rootAccess.valid) {
    return NextResponse.json({ error: '根资源不存在或不可访问' }, { status: 400 });
  }

  const newComment = {
    id: generateId(),
    userId: session.user.id,
    targetType,
    targetId,
    rootType,
    rootId,
    content: trimmedContent,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(comments).values(newComment);

  if (anchor) {
    await db.insert(commentAnchors).values({
      id: generateAnchorId(),
      commentId: newComment.id,
      rootType: anchor.rootType,
      rootId: anchor.rootId,
      blockId: anchor.blockId,
      selectedText: anchor.selectedText.trim(),
      startOffset: anchor.startOffset,
      endOffset: anchor.endOffset,
      prefixText: anchor.prefixText,
      suffixText: anchor.suffixText,
      anchorStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  if (targetType === 'comment') {
    const [parentComment] = await db
      .select({ id: comments.id, userId: comments.userId })
      .from(comments)
      .where(eq(comments.id, targetId))
      .limit(1);

    const notifyUserId = replyToUserId || parentComment?.userId;
    const notifyTargetId = parentComment?.id || targetId;

    if (notifyUserId && notifyUserId !== session.user.id) {
      const notificationId = generateId();
      await db.insert(notifications).values({
        id: notificationId,
        userId: notifyUserId,
        actorId: session.user.id,
        targetType: 'comment',
        targetId: newComment.id,
        isRead: false,
        createdAt: new Date(),
      });
    }
  }

  const [createdComment] = await db
    .select({
      id: comments.id,
      targetType: comments.targetType,
      targetId: comments.targetId,
      rootType: comments.rootType,
      rootId: comments.rootId,
      userId: comments.userId,
      content: comments.content,
      createdAt: comments.createdAt,
      userName: users.name,
      userAvatar: users.image,
      nickname: users.nickname,
      anchorId: commentAnchors.id,
      anchorRootType: commentAnchors.rootType,
      anchorRootId: commentAnchors.rootId,
      blockId: commentAnchors.blockId,
      selectedText: commentAnchors.selectedText,
      startOffset: commentAnchors.startOffset,
      endOffset: commentAnchors.endOffset,
      prefixText: commentAnchors.prefixText,
      suffixText: commentAnchors.suffixText,
      anchorStatus: commentAnchors.anchorStatus,
      anchorCreatedAt: commentAnchors.createdAt,
      anchorUpdatedAt: commentAnchors.updatedAt,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .leftJoin(commentAnchors, eq(commentAnchors.commentId, comments.id))
    .where(eq(comments.id, newComment.id))
    .limit(1);

  let replyToUserName: string | undefined;
  if (targetType === 'comment') {
    const [parentUser] = await db
      .select({
        userName: users.name,
        nickname: users.nickname,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.id, targetId))
      .limit(1);

    if (parentUser) {
      replyToUserName = parentUser.nickname || parentUser.userName || undefined;
    }
  }

  return NextResponse.json({
    data: {
      id: createdComment!.id,
      targetType: createdComment!.targetType,
      targetId: createdComment!.targetId,
      rootType: createdComment!.rootType,
      rootId: createdComment!.rootId,
      userId: createdComment!.userId,
      userName: createdComment!.nickname || createdComment!.userName || '未知用户',
      userAvatar: createdComment!.userAvatar,
      content: createdComment!.content,
      createdAt: createdComment!.createdAt.toISOString(),
      likes: 0,
      isLiked: false,
      replyToUserName,
      anchor: createdComment!.anchorId
        ? {
            id: createdComment!.anchorId,
            commentId: createdComment!.id,
            rootType: createdComment!.anchorRootType as RootType,
            rootId: createdComment!.anchorRootId,
            blockId: createdComment!.blockId,
            selectedText: createdComment!.selectedText,
            startOffset: createdComment!.startOffset,
            endOffset: createdComment!.endOffset,
            prefixText: createdComment!.prefixText,
            suffixText: createdComment!.suffixText,
            anchorStatus: createdComment!.anchorStatus,
            createdAt: createdComment!.anchorCreatedAt?.toISOString(),
            updatedAt: createdComment!.anchorUpdatedAt?.toISOString(),
          }
        : undefined,
    },
  });
}
