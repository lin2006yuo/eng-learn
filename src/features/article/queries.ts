import { desc, eq, lt, and, count } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { articles } from '@/lib/db/articles-schema';
import { users } from '@/lib/db/schema';
import type { ArticleDetailData, ArticleStatus, ArticleSummary } from './types';

function mapArticleRow(row: {
  id: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  authorName: string | null;
  authorNickname: string | null;
}): ArticleDetailData {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    status: row.status as ArticleStatus,
    authorId: row.authorId,
    authorName: row.authorNickname || row.authorName || '未知作者',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() || null,
  };
}

export async function fetchPublicArticles(cursor?: string, limit = 20) {
  const db = getDb();
  const cursorCondition = cursor ? lt(articles.createdAt, new Date(cursor)) : undefined;
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      summary: articles.summary,
      content: articles.content,
      status: articles.status,
      authorId: articles.authorId,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      publishedAt: articles.publishedAt,
      authorName: users.name,
      authorNickname: users.nickname,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(eq(articles.status, 'published'), cursorCondition))
    .orderBy(desc(articles.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const result = hasMore ? rows.slice(0, limit) : rows;
  return {
    articles: result.map(mapArticleRow).map(({ content, ...item }) => item as ArticleSummary),
    hasMore,
    nextCursor: hasMore ? result[result.length - 1]?.createdAt.toISOString() : undefined,
  };
}

export async function fetchArticleById(articleId: string, includeUnpublished = false) {
  const db = getDb();
  const [row] = await db
    .select({
      id: articles.id,
      title: articles.title,
      summary: articles.summary,
      content: articles.content,
      status: articles.status,
      authorId: articles.authorId,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      publishedAt: articles.publishedAt,
      authorName: users.name,
      authorNickname: users.nickname,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.id, articleId))
    .limit(1);

  if (!row) return null;
  if (!includeUnpublished && row.status !== 'published') return null;
  return mapArticleRow(row);
}

export async function countPublishedArticles() {
  const db = getDb();
  const [{ value }] = await db
    .select({ value: count() })
    .from(articles)
    .where(eq(articles.status, 'published'));
  return value || 0;
}

export async function fetchManageArticles(status?: ArticleStatus, authorId?: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      summary: articles.summary,
      content: articles.content,
      status: articles.status,
      authorId: articles.authorId,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      publishedAt: articles.publishedAt,
      authorName: users.name,
      authorNickname: users.nickname,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(
      status ? eq(articles.status, status) : undefined,
      authorId ? eq(articles.authorId, authorId) : undefined
    ))
    .orderBy(desc(articles.updatedAt));

  return rows.map(mapArticleRow).map(({ content, ...item }) => item as ArticleSummary);
}

export async function countAllArticles(status?: ArticleStatus, authorId?: string) {
  const db = getDb();
  const [{ value }] = await db
    .select({ value: count() })
    .from(articles)
    .where(and(
      status ? eq(articles.status, status) : undefined,
      authorId ? eq(articles.authorId, authorId) : undefined
    ));
  return value || 0;
}
