import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { notifications } from '@/lib/db/patterns-schema';
import { eq, inArray, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

/**
 * POST /api/notifications/mark-read
 *
 * Auth: 需要登录
 *
 * Body (三选一, 互斥):
 * - `{ targetId: string }`        标记单条已读
 * - `{ targetIds: string[] }`     批量标记已读
 * - `{ all: true }`               全部标记已读
 *
 * Response:
 * - `{ success: true }`
 */
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const body = await request.json();
  const { targetId, targetIds, all } = body;

  if (!targetId && !targetIds && all !== true) {
    return NextResponse.json({ error: 'targetId、targetIds 或 all 必须传一个' }, { status: 400 });
  }

  const db = getDb();
  const baseWhere = [
    eq(notifications.userId, session.user.id),
    eq(notifications.isRead, false),
  ];

  if (all) {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.userId, session.user.id));
  } else if (targetIds) {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(...baseWhere, inArray(notifications.targetId, targetIds)));
  } else {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(...baseWhere, eq(notifications.targetId, targetId)));
  }

  return NextResponse.json({ success: true });
}
