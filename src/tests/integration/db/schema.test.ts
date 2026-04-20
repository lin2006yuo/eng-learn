import { describe, it, expect, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Database Schema (memory SQLite)', () => {
  let db: ReturnType<typeof drizzle<typeof schema>>;
  let sqlite: Database.Database;

  beforeEach(() => {
    sqlite = new Database(':memory:');
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    sqlite.exec(`
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
        nickname TEXT
      );

      CREATE TABLE session (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
        expires_at INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        ip_address TEXT,
        user_agent TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE account (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
        provider_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        id_token TEXT,
        access_token_expires_at INTEGER,
        refresh_token_expires_at INTEGER,
        scope TEXT,
        password TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE verification (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

    db = drizzle(sqlite, { schema });
  });

  it('可以插入和查询用户', () => {
    const newUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.insert(schema.users).values(newUser).run();

    const result = db.select().from(schema.users).where(eq(schema.users.id, 'user-1')).all();

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Test User');
    expect(result[0]?.email).toBe('test@example.com');
  });

  it('用户邮箱唯一约束', () => {
    const newUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.insert(schema.users).values(newUser).run();

    expect(() => {
      db.insert(schema.users).values({ ...newUser, id: 'user-2' }).run();
    }).toThrow();
  });

  it('插入会话并与用户关联', () => {
    const now = new Date();
    const user = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    db.insert(schema.users).values(user).run();

    const session = {
      id: 'session-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      token: 'token-abc',
      createdAt: now,
      updatedAt: now,
    };

    db.insert(schema.sessions).values(session).run();

    const result = db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.userId, 'user-1'))
      .all();

    expect(result).toHaveLength(1);
    expect(result[0]?.token).toBe('token-abc');
  });

  it('删除用户时级联删除会话', () => {
    const now = new Date();

    db.insert(schema.users).values({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    }).run();

    db.insert(schema.sessions).values({
      id: 'session-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      token: 'token-abc',
      createdAt: now,
      updatedAt: now,
    }).run();

    db.delete(schema.users).where(eq(schema.users.id, 'user-1')).run();

    const sessions = db.select().from(schema.sessions).all();
    expect(sessions).toHaveLength(0);
  });
});
