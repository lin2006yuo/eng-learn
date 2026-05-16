import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@libsql/client';

const envFile = process.argv.includes('--remote') ? '.env.remote' : '.env.local';

try {
  const envPath = resolve(process.cwd(), envFile);
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} catch {
  console.error(`无法加载 ${envFile}，请确保文件存在`);
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL 未设置');
  process.exit(1);
}

const isRemoteDb = dbUrl.startsWith('libsql://') || dbUrl.startsWith('http');

const client = createClient(
  isRemoteDb
    ? { url: dbUrl, authToken: process.env.TURSO_AUTH_TOKEN }
    : { url: dbUrl },
);

async function migrate() {
  console.log(`开始数据迁移 (${envFile})...`);

  const { rows: articleRows } = await client.execute({
    sql: "SELECT COUNT(*) as cnt FROM articles WHERE id NOT LIKE 'article-%'",
    args: [],
  });
  const articleCnt = Number(articleRows[0]?.cnt ?? 0);

  const { rows: postRows } = await client.execute({
    sql: "SELECT COUNT(*) as cnt FROM posts WHERE id NOT LIKE 'post-%'",
    args: [],
  });
  const postCnt = Number(postRows[0]?.cnt ?? 0);

  console.log(`需要迁移: ${articleCnt} 篇文章, ${postCnt} 篇帖子`);

  if (articleCnt === 0 && postCnt === 0) {
    console.log('无需迁移，所有数据已有前缀');
    return;
  }

  await client.executeMultiple(`
    UPDATE articles SET id = 'article-' || id WHERE id NOT LIKE 'article-%';
    UPDATE posts SET id = 'post-' || id WHERE id NOT LIKE 'post-%';

    UPDATE comments SET root_id = 'article-' || root_id WHERE root_type = 'article' AND root_id NOT LIKE 'article-%';
    UPDATE comments SET root_id = 'post-' || root_id WHERE root_type = 'post' AND root_id NOT LIKE 'post-%';
    UPDATE comments SET target_id = 'article-' || target_id WHERE target_type = 'article' AND target_id NOT LIKE 'article-%';
    UPDATE comments SET target_id = 'post-' || target_id WHERE target_type = 'post' AND target_id NOT LIKE 'post-%';

    UPDATE comment_anchors SET root_id = 'article-' || root_id WHERE root_type = 'article' AND root_id NOT LIKE 'article-%';
    UPDATE comment_anchors SET root_id = 'post-' || root_id WHERE root_type = 'post' AND root_id NOT LIKE 'post-%';

    UPDATE notifications SET target_id = 'article-' || target_id WHERE target_type = 'article' AND target_id NOT LIKE 'article-%';
    UPDATE notifications SET target_id = 'post-' || target_id WHERE target_type = 'post' AND target_id NOT LIKE 'post-%';
  `);

  console.log('迁移完成');
}

migrate()
  .catch((err) => {
    console.error('迁移失败:', err);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
