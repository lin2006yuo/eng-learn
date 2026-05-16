import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { notifications, comments, patterns } from '@/lib/db/patterns-schema';
import { articles } from '@/lib/db/articles-schema';
import { users } from '@/lib/db/schema';
import { eq, desc, lt, and, inArray, asc } from 'drizzle-orm';
import { getSession } from '@/lib/auth-helpers';

/**
 * GET /api/notifications
 *
 * Auth: 需要登录
 *
 * Query params:
 * - `cursor`    ISO 时间游标, 分页用
 * - `limit`     每页条数, 1-50, 默认 20
 *
 * Response:
 * - `data`          NotificationItem[]
 *   - `patternTitle`  关联句型标题
 *   - `patternEmoji`  关联句型 emoji
 *   - `targetContent` 被回复的评论内容
 * - `totalCount`  本页数量
 * - `hasMore`     是否有更多
 * - `nextCursor`  下一页游标
 */
export async function GET(request: NextRequest) {
  const session = await getSession(request);

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  const db = getDb();

  const cursorCondition = cursor
    ? lt(notifications.createdAt, new Date(cursor))
    : undefined;

  const notifsRaw = await db
    .select({
      id: notifications.id,
      userId: notifications.userId,
      actorId: notifications.actorId,
      targetType: notifications.targetType,
      targetId: notifications.targetId,
      isRead: notifications.isRead,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
      actorName: users.name,
      actorAvatar: users.image,
      actorNickname: users.nickname,
      targetContent: comments.content,
      rootId: comments.rootId,
    })
    .from(notifications)
    .leftJoin(users, eq(notifications.actorId, users.id))
    .leftJoin(comments, eq(notifications.targetId, comments.id))
    .where(and(eq(notifications.userId, session.user.id), cursorCondition))
    .orderBy(desc(notifications.createdAt))
    .limit(limit + 1);

  const hasMore = notifsRaw.length > limit;
  const result = hasMore ? notifsRaw.slice(0, limit) : notifsRaw;
  const nextCursor = hasMore
    ? result[result.length - 1]?.createdAt.toISOString()
    : undefined;

  const targetIds = result.map(n => n.targetId);
  let myReplyMap: Map<string, string> = new Map();
  if (targetIds.length > 0) {
    const myReplies = await db
      .select({ targetId: comments.targetId, content: comments.content })
      .from(comments)
      .where(
        and(
          eq(comments.targetType, 'comment'),
          inArray(comments.targetId, targetIds),
          eq(comments.userId, session.user.id),
        ),
      )
      .orderBy(asc(comments.createdAt));
    myReplies.forEach(r => {
      myReplyMap.set(r.targetId, r.content);
    });
  }

  const patternRootIds = [...new Set(result.map(n => n.rootId).filter((id): id is string => !!id && id.startsWith('pattern-')))];
  let patternInfoMap: Map<string, { id: string; title: string; emoji: string }> = new Map();
  if (patternRootIds.length > 0) {
    const patternRows = await db
      .select({ id: patterns.id, title: patterns.title, emoji: patterns.emoji })
      .from(patterns)
      .where(inArray(patterns.id, patternRootIds));
    patternInfoMap = new Map(patternRows.map(p => [p.id, p]));
  }

  const articleRootIds = [...new Set(result.map(n => n.rootId).filter((id): id is string => !!id && id.startsWith('article-')))];
  let articleInfoMap: Map<string, { id: string; title: string }> = new Map();
  if (articleRootIds.length > 0) {
    const articleRows = await db
      .select({ id: articles.id, title: articles.title })
      .from(articles)
      .where(inArray(articles.id, articleRootIds));
    articleInfoMap = new Map(articleRows.map(a => [a.id, a]));
  }

  const data = result.map(n => ({
    id: n.id,
    userId: n.userId,
    actorId: n.actorId,
    actorName: n.actorNickname || n.actorName || '未知用户',
    actorAvatar: n.actorAvatar || undefined,
    targetType: n.targetType,
    targetId: n.targetId,
    rootId: n.rootId || undefined,
    targetContent: n.targetContent || undefined,
    myReplyContent: myReplyMap.get(n.targetId) || undefined,
    patternTitle: n.rootId && n.targetType === 'comment' ? patternInfoMap.get(n.rootId)?.title : undefined,
    patternEmoji: n.rootId && n.targetType === 'comment' ? patternInfoMap.get(n.rootId)?.emoji : undefined,
    articleTitle: n.targetType === 'article' ? articleInfoMap.get(n.targetId)?.title : undefined,
    isRead: n.isRead,
    readAt: n.readAt?.toISOString() || null,
    createdAt: n.createdAt.toISOString(),
  }));

  return NextResponse.json({ data, totalCount: result.length, hasMore, nextCursor });
}
