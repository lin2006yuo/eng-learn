import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq, and, count } from 'drizzle-orm';
import * as patternsSchema from '@/lib/db/patterns-schema';
import * as schema from '@/lib/db/schema';

const combinedSchema = { ...patternsSchema, ...schema };

const CREATE_TABLES_SQL = `
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

  CREATE TABLE patterns (
    id TEXT PRIMARY KEY,
    emoji TEXT NOT NULL,
    title TEXT NOT NULL,
    translation TEXT NOT NULL,
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    root_type TEXT NOT NULL,
    root_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE comment_likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL
  );
`;

function executeStatements(client: ReturnType<typeof createClient>, sql: string) {
  sql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)
    .forEach((statement) => {
      client.execute(statement);
    });
}

describe('数据库集成测试 - 评论系统', () => {
  let client: ReturnType<typeof createClient>;
  let db: ReturnType<typeof drizzle<typeof combinedSchema>>;

  beforeEach(() => {
    client = createClient({ url: ':memory:' });
    executeStatements(client, CREATE_TABLES_SQL);
    db = drizzle(client, { schema: combinedSchema });
  });

  afterEach(() => {
    client.close();
  });

  describe('comments表', () => {
    it('插入主评论', async () => {
      const now = new Date();
      await db.insert(schema.users).values({
        id: 'u1', name: 'Test', email: 'test@test.com',
        emailVerified: false, createdAt: now, updatedAt: now,
      }).run();
      await db.insert(patternsSchema.patterns).values({
        id: 'p1', emoji: '📝', title: 'Test', translation: '测试',
        metadata: '{}', createdAt: now, updatedAt: now,
      }).run();

      await db.insert(patternsSchema.comments).values({
        id: 'c1', userId: 'u1', targetType: 'pattern', targetId: 'p1',
        rootType: 'pattern', rootId: 'p1', content: '主评论',
        createdAt: now, updatedAt: now,
      }).run();

      const result = await db.select().from(patternsSchema.comments)
        .where(eq(patternsSchema.comments.id, 'c1')).all();
      expect(result).toHaveLength(1);
      expect(result[0]?.rootType).toBe('pattern');
      expect(result[0]?.rootId).toBe('p1');
      expect(result[0]?.targetType).toBe('pattern');
      expect(result[0]?.targetId).toBe('p1');
    });

    it('插入回复评论', async () => {
      const now = new Date();
      await db.insert(schema.users).values({
        id: 'u1', name: 'Test', email: 'test@test.com',
        emailVerified: false, createdAt: now, updatedAt: now,
      }).run();
      await db.insert(patternsSchema.patterns).values({
        id: 'p1', emoji: '📝', title: 'Test', translation: '测试',
        metadata: '{}', createdAt: now, updatedAt: now,
      }).run();
      await db.insert(patternsSchema.comments).values({
        id: 'A', userId: 'u1', targetType: 'pattern', targetId: 'p1',
        rootType: 'pattern', rootId: 'p1', content: '主评论',
        createdAt: now, updatedAt: now,
      }).run();

      await db.insert(patternsSchema.comments).values({
        id: 'B', userId: 'u1', targetType: 'comment', targetId: 'A',
        rootType: 'pattern', rootId: 'p1', content: '回复A',
        createdAt: now, updatedAt: now,
      }).run();

      await db.insert(patternsSchema.comments).values({
        id: 'C', userId: 'u1', targetType: 'comment', targetId: 'B',
        rootType: 'pattern', rootId: 'p1', content: '回复B',
        createdAt: now, updatedAt: now,
      }).run();

      const replies = await db.select().from(patternsSchema.comments)
        .where(and(eq(patternsSchema.comments.rootId, 'p1'), eq(patternsSchema.comments.targetId, 'A')))
        .all();
      expect(replies).toHaveLength(1);
      expect(replies[0]?.id).toBe('B');

      const allInThread = await db.select().from(patternsSchema.comments)
        .where(eq(patternsSchema.comments.rootId, 'p1'))
        .all();
      expect(allInThread).toHaveLength(3);
    });

    it('删除评论', async () => {
      const now = new Date();
      await db.insert(schema.users).values({
        id: 'u1', name: 'Test', email: 'test@test.com',
        emailVerified: false, createdAt: now, updatedAt: now,
      }).run();
      await db.insert(patternsSchema.patterns).values({
        id: 'p1', emoji: '📝', title: 'Test', translation: '测试',
        metadata: '{}', createdAt: now, updatedAt: now,
      }).run();
      await db.insert(patternsSchema.comments).values({
        id: 'A', userId: 'u1', targetType: 'pattern', targetId: 'p1',
        rootType: 'pattern', rootId: 'p1', content: '主评论',
        createdAt: now, updatedAt: now,
      }).run();

      await db.delete(patternsSchema.comments).where(eq(patternsSchema.comments.id, 'A')).run();

      const remaining = await db.select().from(patternsSchema.comments).all();
      expect(remaining).toHaveLength(0);
    });
  });

  describe('comment_likes表', () => {
    it('插入点赞', async () => {
      const now = new Date();
      await db.insert(schema.users).values({
        id: 'u1', name: 'Test', email: 'test@test.com',
        emailVerified: false, createdAt: now, updatedAt: now,
      }).run();
      await db.insert(patternsSchema.patterns).values({
        id: 'p1', emoji: '📝', title: 'Test', translation: '测试',
        metadata: '{}', createdAt: now, updatedAt: now,
      }).run();
      await db.insert(patternsSchema.comments).values({
        id: 'c1', userId: 'u1', targetType: 'pattern', targetId: 'p1',
        rootType: 'pattern', rootId: 'p1', content: '评论',
        createdAt: now, updatedAt: now,
      }).run();

      await db.insert(patternsSchema.commentLikes).values({
        id: 'cl1', userId: 'u1', commentId: 'c1', createdAt: now,
      }).run();

      const result = await db.select().from(patternsSchema.commentLikes)
        .where(eq(patternsSchema.commentLikes.commentId, 'c1')).all();
      expect(result).toHaveLength(1);
    });

    it('点赞数统计', async () => {
      const now = new Date();
      await db.insert(schema.users).values({
        id: 'u1', name: 'Test', email: 'test@test.com',
        emailVerified: false, createdAt: now, updatedAt: now,
      }).run();
      await db.insert(schema.users).values({
        id: 'u2', name: 'Test2', email: 'test2@test.com',
        emailVerified: false, createdAt: now, updatedAt: now,
      }).run();
      await db.insert(patternsSchema.patterns).values({
        id: 'p1', emoji: '📝', title: 'Test', translation: '测试',
        metadata: '{}', createdAt: now, updatedAt: now,
      }).run();
      await db.insert(patternsSchema.comments).values({
        id: 'c1', userId: 'u1', targetType: 'pattern', targetId: 'p1',
        rootType: 'pattern', rootId: 'p1', content: '评论',
        createdAt: now, updatedAt: now,
      }).run();

      await db.insert(patternsSchema.commentLikes).values({
        id: 'cl1', userId: 'u1', commentId: 'c1', createdAt: now,
      }).run();
      await db.insert(patternsSchema.commentLikes).values({
        id: 'cl2', userId: 'u2', commentId: 'c1', createdAt: now,
      }).run();

      const likeCount = await db.select({ count: count() })
        .from(patternsSchema.commentLikes)
        .where(eq(patternsSchema.commentLikes.commentId, 'c1'))
        .all();
      expect(likeCount[0]?.count).toBe(2);
    });

    it('取消点赞后点赞数减少', async () => {
      const now = new Date();
      await db.insert(schema.users).values({
        id: 'u1', name: 'Test', email: 'test@test.com',
        emailVerified: false, createdAt: now, updatedAt: now,
      }).run();
      await db.insert(patternsSchema.patterns).values({
        id: 'p1', emoji: '📝', title: 'Test', translation: '测试',
        metadata: '{}', createdAt: now, updatedAt: now,
      }).run();
      await db.insert(patternsSchema.comments).values({
        id: 'c1', userId: 'u1', targetType: 'pattern', targetId: 'p1',
        rootType: 'pattern', rootId: 'p1', content: '评论',
        createdAt: now, updatedAt: now,
      }).run();

      await db.insert(patternsSchema.commentLikes).values({
        id: 'cl1', userId: 'u1', commentId: 'c1', createdAt: now,
      }).run();

      await db.delete(patternsSchema.commentLikes).where(eq(patternsSchema.commentLikes.userId, 'u1')).run();

      const likeCount = await db.select({ count: count() })
        .from(patternsSchema.commentLikes)
        .where(eq(patternsSchema.commentLikes.commentId, 'c1'))
        .all();
      expect(likeCount[0]?.count).toBe(0);
    });
  });
});
