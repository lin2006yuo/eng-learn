import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq, and, count } from 'drizzle-orm';
import * as patternsSchema from '@/lib/db/patterns-schema';
import * as schema from '@/lib/db/schema';

const combinedSchema = { ...patternsSchema, ...schema };

describe('数据库集成测试 - 评论系统', () => {
  let sqlite: Database.Database;
  let db: ReturnType<typeof drizzle<typeof combinedSchema>>;

  beforeEach(() => {
    sqlite = new Database(':memory:');
    db = drizzle(sqlite, { schema: combinedSchema });
  });

  afterEach(() => {
    sqlite.close();
  });

  describe('comments表', () => {
    it('插入主评论', () => {
      const now = new Date();
      db.insert(schema.users).values({
        id: 'u1', name: 'Test', email: 'test@test.com',
        emailVerified: false, createdAt: now, updatedAt: now,
      }).run();
      db.insert(patternsSchema.patterns).values({
        id: 'p1', emoji: '📝', title: 'Test', translation: '测试',
        metadata: '{}', createdAt: now, updatedAt: now,
      }).run();

      db.insert(patternsSchema.comments).values({
        id: 'c1', userId: 'u1', targetType: 'pattern', targetId: 'p1',
        rootType: 'pattern', rootId: 'p1', content: '主评论',
        createdAt: now, updatedAt: now,
      }).run();

      const result = db.select().from(patternsSchema.comments)
        .where(eq(patternsSchema.comments.id, 'c1')).all();
      expect(result).toHaveLength(1);
      expect(result[0]?.rootType).toBe('pattern');
      expect(result[0]?.rootId).toBe('p1');
      expect(result[0]?.targetType).toBe('pattern');
      expect(result[0]?.targetId).toBe('p1');
    });

    it('插入回复评论', () => {
      const now = new Date();
      db.insert(schema.users).values({
        id: 'u1', name: 'Test', email: 'test@test.com',
        emailVerified: false, createdAt: now, updatedAt: now,
      }).run();
      db.insert(patternsSchema.patterns).values({
        id: 'p1', emoji: '📝', title: 'Test', translation: '测试',
        metadata: '{}', createdAt: now, updatedAt: now,
      }).run();
      db.insert(patternsSchema.comments).values({
        id: 'A', userId: 'u1', targetType: 'pattern', targetId: 'p1',
        rootType: 'pattern', rootId: 'p1', content: '主评论',
        createdAt: now, updatedAt: now,
      }).run();

      db.insert(patternsSchema.comments).values({
        id: 'B', userId: 'u1', targetType: 'comment', targetId: 'A',
        rootType: 'pattern', rootId: 'p1', content: '回复A',
        createdAt: now, updatedAt: now,
      }).run();

      db.insert(patternsSchema.comments).values({
        id: 'C', userId: 'u1', targetType: 'comment', targetId: 'B',
        rootType: 'pattern', rootId: 'p1', content: '回复B',
        createdAt: now, updatedAt: now,
      }).run();

      const replies = db.select().from(patternsSchema.comments)
        .where(and(eq(patternsSchema.comments.rootId, 'p1'), eq(patternsSchema.comments.targetId, 'A')))
        .all();
      expect(replies).toHaveLength(1);
      expect(replies[0]?.id).toBe('B');

      const allInThread = db.select().from(patternsSchema.comments)
        .where(eq(patternsSchema.comments.rootId, 'p1'))
        .all();
      expect(allInThread).toHaveLength(3);
    });

    it('删除评论', () => {
      const now = new Date();
      db.insert(schema.users).values({
        id: 'u1', name: 'Test', email: 'test@test.com',
        emailVerified: false, createdAt: now, updatedAt: now,
      }).run();
      db.insert(patternsSchema.patterns).values({
        id: 'p1', emoji: '📝', title: 'Test', translation: '测试',
        metadata: '{}', createdAt: now, updatedAt: now,
      }).run();
      db.insert(patternsSchema.comments).values({
        id: 'A', userId: 'u1', targetType: 'pattern', targetId: 'p1',
        rootType: 'pattern', rootId: 'p1', content: '主评论',
        createdAt: now, updatedAt: now,
      }).run();

      db.delete(patternsSchema.comments).where(eq(patternsSchema.comments.id, 'A')).run();

      const remaining = db.select().from(patternsSchema.comments).all();
      expect(remaining).toHaveLength(0);
    });
  });

  describe('comment_likes表', () => {
    it('插入点赞', () => {
      const now = new Date();
      db.insert(schema.users).values({
        id: 'u1', name: 'Test', email: 'test@test.com',
        emailVerified: false, createdAt: now, updatedAt: now,
      }).run();
      db.insert(patternsSchema.patterns).values({
        id: 'p1', emoji: '📝', title: 'Test', translation: '测试',
        metadata: '{}', createdAt: now, updatedAt: now,
      }).run();
      db.insert(patternsSchema.comments).values({
        id: 'c1', userId: 'u1', targetType: 'pattern', targetId: 'p1',
        rootType: 'pattern', rootId: 'p1', content: '评论',
        createdAt: now, updatedAt: now,
      }).run();

      db.insert(patternsSchema.commentLikes).values({
        id: 'cl1', userId: 'u1', commentId: 'c1', createdAt: now,
      }).run();

      const result = db.select().from(patternsSchema.commentLikes)
        .where(eq(patternsSchema.commentLikes.commentId, 'c1')).all();
      expect(result).toHaveLength(1);
    });

    it('点赞数统计', () => {
      const now = new Date();
      db.insert(schema.users).values({
        id: 'u1', name: 'Test', email: 'test@test.com',
        emailVerified: false, createdAt: now, updatedAt: now,
      }).run();
      db.insert(schema.users).values({
        id: 'u2', name: 'Test2', email: 'test2@test.com',
        emailVerified: false, createdAt: now, updatedAt: now,
      }).run();
      db.insert(patternsSchema.patterns).values({
        id: 'p1', emoji: '📝', title: 'Test', translation: '测试',
        metadata: '{}', createdAt: now, updatedAt: now,
      }).run();
      db.insert(patternsSchema.comments).values({
        id: 'c1', userId: 'u1', targetType: 'pattern', targetId: 'p1',
        rootType: 'pattern', rootId: 'p1', content: '评论',
        createdAt: now, updatedAt: now,
      }).run();

      db.insert(patternsSchema.commentLikes).values({
        id: 'cl1', userId: 'u1', commentId: 'c1', createdAt: now,
      }).run();
      db.insert(patternsSchema.commentLikes).values({
        id: 'cl2', userId: 'u2', commentId: 'c1', createdAt: now,
      }).run();

      const likeCount = db.select({ count: count() })
        .from(patternsSchema.commentLikes)
        .where(eq(patternsSchema.commentLikes.commentId, 'c1'))
        .all();
      expect(likeCount[0]?.count).toBe(2);
    });

    it('取消点赞后点赞数减少', () => {
      const now = new Date();
      db.insert(schema.users).values({
        id: 'u1', name: 'Test', email: 'test@test.com',
        emailVerified: false, createdAt: now, updatedAt: now,
      }).run();
      db.insert(patternsSchema.patterns).values({
        id: 'p1', emoji: '📝', title: 'Test', translation: '测试',
        metadata: '{}', createdAt: now, updatedAt: now,
      }).run();
      db.insert(patternsSchema.comments).values({
        id: 'c1', userId: 'u1', targetType: 'pattern', targetId: 'p1',
        rootType: 'pattern', rootId: 'p1', content: '评论',
        createdAt: now, updatedAt: now,
      }).run();

      db.insert(patternsSchema.commentLikes).values({
        id: 'cl1', userId: 'u1', commentId: 'c1', createdAt: now,
      }).run();

      db.delete(patternsSchema.commentLikes).where(eq(patternsSchema.commentLikes.userId, 'u1')).run();

      const likeCount = db.select({ count: count() })
        .from(patternsSchema.commentLikes)
        .where(eq(patternsSchema.commentLikes.commentId, 'c1'))
        .all();
      expect(likeCount[0]?.count).toBe(0);
    });
  });
});
