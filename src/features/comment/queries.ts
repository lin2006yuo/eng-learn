import { getDb } from '@/lib/db';
import { comments, commentLikes, patterns, notifications } from '@/lib/db/patterns-schema';
import { users } from '@/lib/db/schema';
import { eq, inArray, desc, asc, sql, and, lt } from 'drizzle-orm';
import type { RootType } from './types';

interface CommentRaw {
  id: string;
  targetType: string;
  targetId: string;
  rootType: string;
  rootId: string;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  nickname: string | null;
  content: string;
  createdAt: Date;
  parentUserName?: string | null;
}

export async function fetchCommentsByRoot(
  rootType: RootType,
  rootId: string,
  cursor?: string,
  limit = 20,
) {
  const db = getDb();

  const cursorCondition = cursor
    ? lt(comments.createdAt, new Date(cursor))
    : undefined;

  const commentsRaw = await db
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
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(
      and(
        eq(comments.rootType, rootType),
        eq(comments.rootId, rootId),
        eq(comments.targetType, rootType),
        cursorCondition,
      ),
    )
    .orderBy(desc(comments.createdAt))
    .limit(limit + 1);

  const hasMore = commentsRaw.length > limit;
  const result = hasMore ? commentsRaw.slice(0, limit) : commentsRaw;
  const nextCursor = hasMore
    ? result[result.length - 1]?.createdAt.toISOString()
    : undefined;

  return { comments: result as CommentRaw[], hasMore, nextCursor };
}

export async function fetchReplies(rootType: RootType, rootId: string) {
  const db = getDb();

  const repliesRaw = await db
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
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(
      and(
        eq(comments.rootType, rootType),
        eq(comments.rootId, rootId),
        eq(comments.targetType, 'comment'),
      ),
    )
    .orderBy(asc(comments.createdAt))
    .all();

  const targetIds = repliesRaw.map(r => r.targetId);
  if (targetIds.length === 0) return repliesRaw as CommentRaw[];

  const parentUsersRaw = await db
    .select({
      id: comments.id,
      userName: users.name,
      nickname: users.nickname,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(inArray(comments.id, targetIds))
    .all();

  const parentUserNameMap = new Map<string, string>();
  parentUsersRaw.forEach(pu => {
    parentUserNameMap.set(pu.id, pu.nickname || pu.userName || '');
  });

  const result = repliesRaw.map(r => ({
    ...r,
    parentUserName: parentUserNameMap.get(r.targetId),
  }));

  return result as CommentRaw[];
}

export async function fetchCommentsByUser(
  userId: string,
  cursor?: string,
  limit = 20,
) {
  const db = getDb();

  const cursorCondition = cursor
    ? lt(comments.createdAt, new Date(cursor))
    : undefined;

  const commentsRaw = await db
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
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.userId, userId), cursorCondition))
    .orderBy(desc(comments.createdAt))
    .limit(limit + 1);

  const hasMore = commentsRaw.length > limit;
  const result = hasMore ? commentsRaw.slice(0, limit) : commentsRaw;
  const nextCursor = hasMore
    ? result[result.length - 1]?.createdAt.toISOString()
    : undefined;

  return { comments: result as CommentRaw[], hasMore, nextCursor };
}

export async function fetchLikesInfo(commentIds: string[]) {
  if (commentIds.length === 0) {
    return { likesCountMap: new Map<string, number>(), likedByCurrentUserMap: new Map<string, boolean>() };
  }

  const db = getDb();

  const likesInfoRaw = await db
    .select({
      commentId: commentLikes.commentId,
      count: sql<number>`COUNT(*)`,
    })
    .from(commentLikes)
    .where(inArray(commentLikes.commentId, commentIds))
    .groupBy(commentLikes.commentId)
    .all();

  const likesCountMap = new Map<string, number>();
  likesInfoRaw.forEach(row => {
    likesCountMap.set(row.commentId, row.count);
  });

  return { likesCountMap };
}

export async function fetchCurrentUserLikes(commentIds: string[], currentUserId: string | null) {
  if (!currentUserId || commentIds.length === 0) return new Map<string, boolean>();

  const db = getDb();

  const userLikesRaw = await db
    .select({ commentId: commentLikes.commentId })
    .from(commentLikes)
    .where(and(
      inArray(commentLikes.commentId, commentIds),
      eq(commentLikes.userId, currentUserId),
    ))
    .all();

  const likedByCurrentUserMap = new Map<string, boolean>();
  userLikesRaw.forEach(row => {
    likedByCurrentUserMap.set(row.commentId, true);
  });

  return likedByCurrentUserMap;
}

export async function fetchReplyCounts(parentIds: string[]) {
  if (parentIds.length === 0) return new Map<string, number>();

  const db = getDb();

  const replyCountRows = await db
    .select({
      parentId: comments.targetId,
      count: sql<number>`COUNT(*)`,
    })
    .from(comments)
    .where(
      and(
        inArray(comments.targetId, parentIds),
        eq(comments.targetType, 'comment'),
      ),
    )
    .groupBy(comments.targetId);

  const replyCountMap = new Map<string, number>();
  replyCountRows.forEach(row => {
    replyCountMap.set(row.parentId, row.count);
  });

  return replyCountMap;
}

const validationStrategies: Record<string, (id: string) => Promise<boolean>> = {
  pattern: async (id) => {
    const db = getDb();
    const [pattern] = await db.select({ id: patterns.id }).from(patterns).where(eq(patterns.id, id)).limit(1);
    return !!pattern;
  },
  comment: async (id) => {
    const db = getDb();
    const [comment] = await db.select({ id: comments.id }).from(comments).where(eq(comments.id, id)).limit(1);
    return !!comment;
  },
};

export async function validateTargetExists(targetType: string, targetId: string): Promise<boolean> {
  const strategy = validationStrategies[targetType];
  if (!strategy) return false;
  return strategy(targetId);
}

export async function countCommentsByUser(userId: string): Promise<number> {
  const db = getDb();
  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(comments)
    .where(eq(comments.userId, userId));
  return count;
}
