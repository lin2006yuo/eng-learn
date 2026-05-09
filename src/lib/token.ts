import { createHash, randomBytes } from 'crypto';
import { eq, and } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function createApiToken(
  userId: string,
  name?: string,
  expiresInDays?: number
): Promise<string> {
  const db = getDb();

  if (name) {
    await db
      .delete(schema.apiTokens)
      .where(
        and(
          eq(schema.apiTokens.userId, userId),
          eq(schema.apiTokens.name, name)
        )
      );
  }

  const plainToken = generateToken();
  const tokenHash = hashToken(plainToken);

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : undefined;

  await db.insert(schema.apiTokens).values({
    id: `atok_${randomBytes(8).toString('hex')}`,
    userId,
    tokenHash,
    name: name ?? null,
    expiresAt,
  });

  return plainToken;
}

export async function validateApiToken(plainToken: string): Promise<string | null> {
  const db = getDb();
  const tokenHash = hashToken(plainToken);

  const row = await db.query.apiTokens.findFirst({
    where: eq(schema.apiTokens.tokenHash, tokenHash),
  });

  if (!row) return null;

  if (row.expiresAt && new Date(row.expiresAt) < new Date()) return null;

  await db
    .update(schema.apiTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(schema.apiTokens.id, row.id));

  return row.userId;
}
