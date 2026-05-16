import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const imageCache = sqliteTable('image_cache', {
  hash: text('hash').primaryKey(),
  url: text('url').notNull(),
  byteSize: integer('byte_size').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export type ImageCache = typeof imageCache.$inferSelect;
export type NewImageCache = typeof imageCache.$inferInsert;
