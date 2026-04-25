import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const isRemoteDb = process.env.DATABASE_URL?.startsWith('libsql://') ||
                   process.env.DATABASE_URL?.startsWith('http');

console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
console.log('Using dialect:', isRemoteDb ? 'turso' : 'sqlite');

export default defineConfig({
  schema: ['./src/lib/db/schema.ts', './src/lib/db/patterns-schema.ts', './src/lib/db/articles-schema.ts', './src/lib/db/posts-schema.ts'],
  out: './drizzle',
  dialect: isRemoteDb ? 'turso' : 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
