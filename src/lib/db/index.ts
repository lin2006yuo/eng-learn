import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import * as patternsSchema from './patterns-schema';
import * as articlesSchema from './articles-schema';

const combinedSchema = { ...schema, ...patternsSchema, ...articlesSchema };

let db: ReturnType<typeof drizzle<typeof combinedSchema>>;

export function getDb() {
  if (!db) {
    const isRemoteDb = process.env.DATABASE_URL?.startsWith('libsql://') ||
                       process.env.DATABASE_URL?.startsWith('http');

    if (isRemoteDb) {
      const client = createClient({
        url: process.env.DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      db = drizzle(client, { schema: combinedSchema });
    } else {
      const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './local.db';
      const client = createClient({
        url: `file:${dbPath}`,
      });
      db = drizzle(client, { schema: combinedSchema });
    }
  }
  return db;
}

export { schema, patternsSchema, articlesSchema };
