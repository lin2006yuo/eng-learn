import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
const isRemoteDb = databaseUrl?.startsWith('libsql://') || databaseUrl?.startsWith('http');

export default defineConfig({
  schema: ['./src/lib/db/schema.ts', './src/lib/db/patterns-schema.ts', './src/lib/db/articles-schema.ts'],
  out: './drizzle',
  dialect: isRemoteDb ? 'turso' : 'sqlite',
  dbCredentials: {
    url: databaseUrl || 'file:./local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
