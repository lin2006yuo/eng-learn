import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import path from 'node:path';

function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
}

function isRemoteUrl(url: string) {
  return url.startsWith('libsql://') || url.startsWith('http');
}

async function main() {
  const databaseUrl = getDatabaseUrl();

  // 在 Vercel 构建环境里，如果没拿到数据库连接信息，宁可构建失败，避免“部署成功但运行时报表不存在”。
  if (process.env.VERCEL && !databaseUrl) {
    throw new Error(
      'Missing DATABASE_URL / TURSO_DATABASE_URL in Vercel build environment. ' +
        'Please set the environment variable for the correct scope (Production/Preview).',
    );
  }

  const url = databaseUrl || 'file:./local.db';
  const remote = isRemoteUrl(url);

  if (remote && process.env.VERCEL && !process.env.TURSO_AUTH_TOKEN) {
    throw new Error('Missing TURSO_AUTH_TOKEN in Vercel build environment.');
  }

  const effectiveLocalUrl = url.startsWith('file:') ? url : `file:${url}`;
  const displayUrl = remote ? url : effectiveLocalUrl;

  console.log(`[db:migrate] Using ${remote ? 'remote' : 'local'} database: ${displayUrl}`);

  const client = createClient(
    remote
      ? {
          url,
          authToken: process.env.TURSO_AUTH_TOKEN,
        }
      : {
          url: effectiveLocalUrl,
        },
  );

  const db = drizzle(client);

  try {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'drizzle'),
    });

    console.log('[db:migrate] Migration finished successfully');
  } finally {
    client.close();
  }
}

main().catch((err) => {
  console.error('[db:migrate] Migration failed');
  console.error(err);
  process.exit(1);
});
