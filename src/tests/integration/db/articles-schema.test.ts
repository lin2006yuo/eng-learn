import { beforeEach, describe, expect, it } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import * as articlesSchema from '@/lib/db/articles-schema';
import * as schema from '@/lib/db/schema';

const combinedSchema = { ...schema, ...articlesSchema };

describe('Database Schema (memory SQLite) - articles', () => {
  let db: ReturnType<typeof drizzle<typeof combinedSchema>>;
  let client: ReturnType<typeof createClient>;

  beforeEach(() => {
    client = createClient({ url: ':memory:' });
    const createTablesSql = `
      CREATE TABLE user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        email_verified INTEGER NOT NULL DEFAULT 0,
        image TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        username TEXT UNIQUE,
        display_username TEXT,
        nickname TEXT,
        role TEXT NOT NULL DEFAULT 'user'
      );

      CREATE TABLE articles (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'draft',
        published_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `;
    createTablesSql
      .split(';')
      .map((statement) => statement.trim())
      .filter(Boolean)
      .forEach((statement) => {
        client.execute(statement);
      });
    db = drizzle(client, { schema: combinedSchema });
  });

  it('可以插入已发布文章', async () => {
    const now = new Date();
    await db.insert(schema.users).values({
      id: 'user-1',
      name: 'Author',
      email: 'author@test.com',
      emailVerified: false,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    }).run();

    await db.insert(articlesSchema.articles).values({
      id: 'article-1',
      title: '文章标题',
      summary: '文章摘要',
      content: '文章正文',
      authorId: 'user-1',
      status: 'published',
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    }).run();

    const result = await db
      .select()
      .from(articlesSchema.articles)
      .where(eq(articlesSchema.articles.id, 'article-1'))
      .all();
    expect(result).toHaveLength(1);
    expect(result[0]?.status).toBe('published');
    expect(result[0]?.authorId).toBe('user-1');
  });
});
