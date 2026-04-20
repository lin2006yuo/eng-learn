import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { patterns, examples, studyPlans } from '../src/lib/db/patterns-schema';
import patternsData from '../src/data/patterns.json';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './local.db';
const client = createClient({
  url: `file:${dbPath}`,
});
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
