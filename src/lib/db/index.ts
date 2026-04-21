import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import * as patternsSchema from './patterns-schema';
import * as articlesSchema from './articles-schema';

const combinedSchema = { ...schema, ...patternsSchema, ...articlesSchema };

let db: ReturnType<typeof drizzle<typeof combinedSchema>>;

export function getDb() {
  if (!db) {
    const databaseUrl = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
    const isRemoteDb = databaseUrl?.startsWith('libsql://') || databaseUrl?.startsWith('http');

    if (isRemoteDb && databaseUrl) {
      const client = createClient({
        url: databaseUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      db = drizzle(client, { schema: combinedSchema });
    } else {
      const dbPath = databaseUrl?.replace(/^file:/, '') || './local.db';
      const client = createClient({
        url: `file:${dbPath}`,
      });
      db = drizzle(client, { schema: combinedSchema });
    }
  }
  return db;
}

export { schema, patternsSchema, articlesSchema };
