import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { comments } from '@/lib/db/patterns-schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId 必传' }, { status: 400 });
  }

  const db = getDb();

  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(comments)
    .where(eq(comments.userId, userId));

  return NextResponse.json({ data: { count } });
}
