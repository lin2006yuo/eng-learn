import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { imageCache } from '@/lib/db/image-cache-schema';

export function hashBuffer(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export async function findExistingImage(hash: string): Promise<string | null> {
  const db = getDb();
  const row = await db.query.imageCache.findFirst({
    where: eq(imageCache.hash, hash),
  });
  return row?.url ?? null;
}

export async function saveImageCache(hash: string, url: string, byteSize: number): Promise<void> {
  const db = getDb();
  await db.insert(imageCache).values({ hash, url, byteSize });
}
