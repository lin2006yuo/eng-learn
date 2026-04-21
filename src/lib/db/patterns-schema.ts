import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { users } from './schema';

export const patterns = sqliteTable('patterns', {
  id: text('id').primaryKey(),
  emoji: text('emoji').notNull(),
  title: text('title').notNull(),
  translation: text('translation').notNull(),
  metadata: text('metadata').notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const examples = sqliteTable('examples', {
  id: text('id').primaryKey(),
  patternId: text('pattern_id')
    .notNull()
    .references(() => patterns.id, { onDelete: 'cascade' }),
  en: text('en').notNull(),
  zh: text('zh').notNull(),
  metadata: text('metadata').notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const patternLikes = sqliteTable('pattern_likes', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  patternId: text('pattern_id')
    .notNull()
    .references(() => patterns.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  rootType: text('root_type').notNull(),
  rootId: text('root_id').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const commentAnchors = sqliteTable('comment_anchors', {
  id: text('id').primaryKey(),
  commentId: text('comment_id')
    .notNull()
    .unique()
    .references(() => comments.id, { onDelete: 'cascade' }),
  rootType: text('root_type').notNull(),
  rootId: text('root_id').notNull(),
  blockId: text('block_id').notNull(),
  selectedText: text('selected_text').notNull(),
  startOffset: integer('start_offset').notNull(),
  endOffset: integer('end_offset').notNull(),
  prefixText: text('prefix_text').notNull().default(''),
  suffixText: text('suffix_text').notNull().default(''),
  anchorStatus: text('anchor_status').notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  actorId: text('actor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  readAt: integer('read_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const commentLikes = sqliteTable('comment_likes', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  commentId: text('comment_id')
    .notNull()
    .references(() => comments.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const studyPlans = sqliteTable('study_plans', {
  id: text('id').primaryKey(),
  dayNumber: integer('day_number').notNull(),
  patternId: text('pattern_id')
    .notNull()
    .references(() => patterns.id, { onDelete: 'cascade' }),
  metadata: text('metadata').notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const patternsRelations = relations(patterns, ({ many }) => ({
  examples: many(examples),
  likes: many(patternLikes),
  studyPlans: many(studyPlans),
}));

export const examplesRelations = relations(examples, ({ one }) => ({
  pattern: one(patterns, { fields: [examples.patternId], references: [patterns.id] }),
}));

export const patternLikesRelations = relations(patternLikes, ({ one }) => ({
  pattern: one(patterns, { fields: [patternLikes.patternId], references: [patterns.id] }),
  user: one(users, { fields: [patternLikes.userId], references: [users.id] }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  anchor: one(commentAnchors, { fields: [comments.id], references: [commentAnchors.commentId] }),
  likes: many(commentLikes),
}));

export const commentAnchorsRelations = relations(commentAnchors, ({ one }) => ({
  comment: one(comments, { fields: [commentAnchors.commentId], references: [comments.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  actor: one(users, { fields: [notifications.actorId], references: [users.id] }),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  user: one(users, { fields: [commentLikes.userId], references: [users.id] }),
  comment: one(comments, { fields: [commentLikes.commentId], references: [comments.id] }),
}));

export const studyPlansRelations = relations(studyPlans, ({ one }) => ({
  pattern: one(patterns, { fields: [studyPlans.patternId], references: [patterns.id] }),
}));

export type Pattern = typeof patterns.$inferSelect;
export type Example = typeof examples.$inferSelect;
export type PatternLike = typeof patternLikes.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type CommentAnchor = typeof commentAnchors.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type CommentLike = typeof commentLikes.$inferSelect;
export type StudyPlan = typeof studyPlans.$inferSelect;
