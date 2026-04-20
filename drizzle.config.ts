import { defineConfig } from 'drizzle-kit';

const isRemoteDb = process.env.DATABASE_URL?.startsWith('libsql://') ||
                   process.env.DATABASE_URL?.startsWith('http');

export default defineConfig({
  schema: ['./src/lib/db/schema.ts', './src/lib/db/patterns-schema.ts'],
  out: './drizzle',
  dialect: isRemoteDb ? 'turso' : 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
