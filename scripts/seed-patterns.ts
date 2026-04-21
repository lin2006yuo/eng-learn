import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { patterns, examples, studyPlans } from '../src/lib/db/patterns-schema';
import patternsData from '../src/data/patterns.json';

// 手动加载 .env.local
function loadEnvLocal() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // 去除引号
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } catch {
    // .env.local 不存在时忽略
  }
}
loadEnvLocal();

const isRemoteDb = process.env.DATABASE_URL?.startsWith('libsql://') ||
                   process.env.DATABASE_URL?.startsWith('http');

const client = createClient(
  isRemoteDb
    ? {
        url: process.env.DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }
    : {
        url: process.env.DATABASE_URL || 'file:./local.db',
      }
);
const db = drizzle(client);

async function seed() {
  console.log('清空已有数据...');
  await db.delete(studyPlans);
  await db.delete(examples);
  await db.delete(patterns);

  console.log('开始导入句型数据...');

  let patternCount = 0;
  let exampleCount = 0;
  let planCount = 0;

  for (const jsonPattern of patternsData.patterns) {
    const metadata = (jsonPattern as any).metadata || {};
    const metadataJson = JSON.stringify(metadata);

    await db.insert(patterns).values({
      id: jsonPattern.id,
      emoji: jsonPattern.emoji,
      title: jsonPattern.title,
      translation: jsonPattern.translation,
      metadata: metadataJson,
    });
    patternCount++;

    if (metadata.study_day != null) {
      await db.insert(studyPlans).values({
        id: `plan-${metadata.study_day}-${jsonPattern.id}`,
        dayNumber: metadata.study_day,
        patternId: jsonPattern.id,
        metadata: '{}',
      });
      planCount++;
    }

    for (const example of jsonPattern.examples) {
      const exampleMetadata = (example as any).metadata || {};
      await db.insert(examples).values({
        id: example.id,
        patternId: jsonPattern.id,
        en: example.en,
        zh: example.zh,
        metadata: JSON.stringify(exampleMetadata),
      });
      exampleCount++;
    }
  }

  console.log(`导入完成: ${patternCount} 个句型, ${exampleCount} 个例句, ${planCount} 个学习计划`);
}

seed()
  .catch((err) => {
    console.error('导入失败:', err);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
