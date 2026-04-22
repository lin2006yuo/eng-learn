import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as articlesSchema from '@/lib/db/articles-schema';
import * as schema from '@/lib/db/schema';
import * as patternsSchema from '@/lib/db/patterns-schema';

const combinedSchema = { ...schema, ...patternsSchema, ...articlesSchema };

const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS user (
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

  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS account (
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

  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER,
    updated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS patterns (
    id TEXT PRIMARY KEY,
    emoji TEXT NOT NULL,
    title TEXT NOT NULL,
    translation TEXT NOT NULL,
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS examples (
    id TEXT PRIMARY KEY,
    pattern_id TEXT NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
    en TEXT NOT NULL,
    zh TEXT NOT NULL,
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pattern_likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    pattern_id TEXT NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    root_type TEXT NOT NULL,
    root_id TEXT NOT NULL,
    content TEXT NOT NULL,
    reply_to_user_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comment_likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS study_plans (
    id TEXT PRIMARY KEY,
    day_number INTEGER NOT NULL,
    pattern_id TEXT NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS articles (
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

export function createTestDb() {
  const client = createClient({
    url: ':memory:',
  });
  CREATE_TABLES_SQL
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)
    .forEach((statement) => {
      client.execute(statement);
    });

  const db = drizzle(client, { schema: combinedSchema });

  const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      username({
        minUsernameLength: 3,
        maxUsernameLength: 31,
      }),
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    user: {
      additionalFields: {
        nickname: {
          type: 'string',
          required: false,
        },
        role: {
          type: 'string',
          required: false,
          defaultValue: 'user',
        },
        isAgent: {
          type: 'boolean',
          required: false,
          defaultValue: false,
        },
      },
    },
  });

  async function registerUser(username: string, email: string, password: string) {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: username,
        username,
      },
    });
    return result.user;
  }

  async function loginAndGetCookie(username: string, password: string) {
    const result = await auth.api.signInUsername({
      body: { username, password },
      returnHeaders: true,
    });

    const cookies = result.headers.getSetCookie();
    const sessionCookie = cookies.find((c) =>
      c.startsWith('better-auth.session_token=')
    );

    if (!sessionCookie) throw new Error('Failed to get session cookie');

    const token = sessionCookie.split('=')[1].split(';')[0];
    const headers = new Headers({
      cookie: `better-auth.session_token=${token}`,
    });

    const session = await auth.api.getSession({ headers });
    return { headers, userId: session!.user.id };
  }

  async function createComment(data: {
    id: string;
    userId: string;
    targetType: string;
    targetId: string;
    content: string;
    rootType: string;
    rootId: string;
    replyToUserId?: string | null;
  }) {
    const now = new Date();
    await db.insert(patternsSchema.comments).values({
      id: data.id,
      userId: data.userId,
      targetType: data.targetType,
      targetId: data.targetId,
      rootType: data.rootType,
      rootId: data.rootId,
      content: data.content,
      createdAt: now,
      updatedAt: now,
    });
  }

  async function createPattern(id: string, title: string, emoji: string, translation: string) {
    const now = new Date();
    await db.insert(patternsSchema.patterns).values({
      id,
      title,
      emoji,
      translation,
      metadata: '{}',
      createdAt: now,
      updatedAt: now,
    });
  }

  return {
    auth,
    db,
    client,
    registerUser,
    loginAndGetCookie,
    createComment,
    createPattern,
    cleanup: () => {
      client.close();
    },
  };
}
