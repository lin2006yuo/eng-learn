import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { articles } from '@/lib/db/articles-schema';
import { comments } from '@/lib/db/patterns-schema';
import { users } from '@/lib/db/schema';
import { countEnglishWords, getReadingMinutes } from './article-utils';
import type { ArticleDetail } from './types';

interface ArticleRow {
  id: string;
  userId: string;
  title: string;
  summary: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string | null;
  authorName: string | null;
  authorNickname: string | null;
  authorImage: string | null;
}

function buildArticle(row: ArticleRow, commentCount: number): ArticleDetail {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    commentCount,
    wordCount: countEnglishWords(row.content),
    readingMinutes: getReadingMinutes(row.content),
    author: {
      id: row.authorId || row.userId,
      name: row.authorName || '匿名用户',
      nickname: row.authorNickname || row.authorName || '匿名用户',
      image: row.authorImage || undefined,
    },
  };
}

async function fetchCommentCountMap(articleIds: string[]) {
  if (articleIds.length === 0) {
    return new Map<string, number>();
  }

  const db = getDb();
  const rows = await db
    .select({ rootId: comments.rootId, count: sql<number>`COUNT(*)` })
    .from(comments)
    .where(and(eq(comments.rootType, 'article'), inArray(comments.rootId, articleIds)))
    .groupBy(comments.rootId);

  return new Map(rows.map((row) => [row.rootId, row.count]));
}

export async function listArticles() {
  const db = getDb();
  const rows = await db
    .select({
      id: articles.id,
      userId: articles.userId,
      title: articles.title,
      summary: articles.summary,
      content: articles.content,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      authorId: users.id,
      authorName: users.name,
      authorNickname: users.nickname,
      authorImage: users.image,
    })
    .from(articles)
    .leftJoin(users, eq(articles.userId, users.id))
    .orderBy(desc(articles.createdAt));

  const countMap = await fetchCommentCountMap(rows.map((row) => row.id));
  return rows.map((row) => buildArticle(row, countMap.get(row.id) || 0));
}

export async function getArticleById(articleId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: articles.id,
      userId: articles.userId,
      title: articles.title,
      summary: articles.summary,
      content: articles.content,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      authorId: users.id,
      authorName: users.name,
      authorNickname: users.nickname,
      authorImage: users.image,
    })
    .from(articles)
    .leftJoin(users, eq(articles.userId, users.id))
    .where(eq(articles.id, articleId))
    .limit(1);

  if (!row) {
    return null;
  }

  const countMap = await fetchCommentCountMap([articleId]);
  return buildArticle(row, countMap.get(articleId) || 0);
}
