import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { notifications } from '@/lib/db/patterns-schema';
import { eq, sql, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

/**
 * GET /api/notifications/unread-count
 *
 * Auth: 需要登录
 *
 * Response:
 * - `data.total`  当前用户未读通知数量
 */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const db = getDb();

  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(notifications)
    .where(and(
      eq(notifications.userId, session.user.id),
      eq(notifications.isRead, false),
    ));

  return NextResponse.json({ data: { total: count } });
}
