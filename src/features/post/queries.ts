import { desc, eq, lt, and, count, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { posts } from '@/lib/db/posts-schema';
import { users } from '@/lib/db/schema';
import type { PostDetailData, PostStatus, PostSummary } from './types';

function mapPostRow(row: {
  id: string;
  title: string;
  content: string;
  status: string;
  authorId: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  authorName: string | null;
  authorNickname: string | null;
}): PostDetailData {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    status: row.status as PostStatus,
    authorId: row.authorId,
    viewCount: row.viewCount,
    authorName: row.authorNickname || row.authorName || '未知作者',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() || null,
  };
}

export async function fetchPublicPosts(cursor?: string, limit = 20) {
  const db = getDb();
  const cursorCondition = cursor ? lt(posts.createdAt, new Date(cursor)) : undefined;
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      status: posts.status,
      authorId: posts.authorId,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      publishedAt: posts.publishedAt,
      authorName: users.name,
      authorNickname: users.nickname,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.status, 'published'), cursorCondition))
    .orderBy(desc(posts.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const result = hasMore ? rows.slice(0, limit) : rows;
  return {
    posts: result.map(mapPostRow).map(({ content, ...item }) => item as PostSummary),
    hasMore,
    nextCursor: hasMore ? result[result.length - 1]?.createdAt.toISOString() : undefined,
  };
}

export async function fetchPostById(postId: string, includeUnpublished = false) {
  const db = getDb();
  const [row] = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      status: posts.status,
      authorId: posts.authorId,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      publishedAt: posts.publishedAt,
      authorName: users.name,
      authorNickname: users.nickname,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, postId))
    .limit(1);

  if (!row) return null;
  if (!includeUnpublished && row.status !== 'published') return null;
  return mapPostRow(row);
}

export async function incrementPostViewCount(postId: string) {
  const db = getDb();
  await db
    .update(posts)
    .set({ viewCount: sql`${posts.viewCount} + 1` })
    .where(eq(posts.id, postId));
}

export async function countPublishedPosts() {
  const db = getDb();
  const [{ value }] = await db
    .select({ value: count() })
    .from(posts)
    .where(eq(posts.status, 'published'));
  return value || 0;
}

export async function fetchManagePosts(status?: PostStatus, authorId?: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      status: posts.status,
      authorId: posts.authorId,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      publishedAt: posts.publishedAt,
      authorName: users.name,
      authorNickname: users.nickname,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(
      status ? eq(posts.status, status) : undefined,
      authorId ? eq(posts.authorId, authorId) : undefined
    ))
    .orderBy(desc(posts.updatedAt));

  return rows.map(mapPostRow).map(({ content, ...item }) => item as PostSummary);
}

export async function countAllPosts(status?: PostStatus, authorId?: string) {
  const db = getDb();
  const [{ value }] = await db
    .select({ value: count() })
    .from(posts)
    .where(and(
      status ? eq(posts.status, status) : undefined,
      authorId ? eq(posts.authorId, authorId) : undefined
    ));
  return value || 0;
}
