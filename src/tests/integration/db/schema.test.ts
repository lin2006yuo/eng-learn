import { describe, it, expect, beforeEach } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Database Schema (memory SQLite)', () => {
  let db: ReturnType<typeof drizzle<typeof schema>>;
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
        role TEXT NOT NULL DEFAULT 'user',
        is_agent INTEGER NOT NULL DEFAULT 0
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
    `;

    createTablesSql
      .split(';')
      .map((statement) => statement.trim())
      .filter(Boolean)
      .forEach((statement) => {
        client.execute(statement);
      });

    db = drizzle(client, { schema });
  });

  it('可以插入和查询用户', async () => {
    const newUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(schema.users).values(newUser).run();

    const result = await db.select().from(schema.users).where(eq(schema.users.id, 'user-1')).all();

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Test User');
    expect(result[0]?.email).toBe('test@example.com');
    expect(result[0]?.role).toBe('user');
  });

  it('用户邮箱唯一约束', async () => {
    const newUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(schema.users).values(newUser).run();

    await expect(
      db.insert(schema.users).values({ ...newUser, id: 'user-2' }).run()
    ).rejects.toThrow();
  });

  it('插入会话并与用户关联', async () => {
    const now = new Date();
    const user = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(schema.users).values(user).run();

    const session = {
      id: 'session-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      token: 'token-abc',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(schema.sessions).values(session).run();

    const result = await db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.userId, 'user-1'))
      .all();

    expect(result).toHaveLength(1);
    expect(result[0]?.token).toBe('token-abc');
  });

  it('删除用户时级联删除会话', async () => {
    const now = new Date();

    await db.insert(schema.users).values({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    }).run();

    await db.insert(schema.sessions).values({
      id: 'session-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      token: 'token-abc',
      createdAt: now,
      updatedAt: now,
    }).run();

    await db.delete(schema.users).where(eq(schema.users.id, 'user-1')).run();

    const sessions = await db.select().from(schema.sessions).all();
    expect(sessions).toHaveLength(0);
  });
});
