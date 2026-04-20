import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { comments, commentLikes, notifications } from '@/lib/db/patterns-schema';
import { eq, and, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';

/**
 * DELETE /api/comments/:commentId
 *
 * Auth: 需要登录, 仅能删除自己的评论
 *
 * Side effects:
 * - 级联删除所有子评论 (BFS 遍历)
 * - 清理关联的点赞记录和通知
 *
 * Response:
 * - `{ success: true }`
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const db = getDb();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { commentId } = await params;

  const [comment] = await db
    .select({ id: comments.id, userId: comments.userId, targetType: comments.targetType, targetId: comments.targetId })
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!comment) {
    return NextResponse.json({ error: '评论不存在' }, { status: 404 });
  }

  if (comment.userId !== session.user.id) {
    return NextResponse.json({ error: '无权删除该评论' }, { status: 403 });
  }

  const allDescendantIds = [commentId];
  let pending = [commentId];

  while (pending.length > 0) {
    const directReplies = await db
      .select({ id: comments.id })
      .from(comments)
      .where(and(eq(comments.targetType, 'comment'), inArray(comments.targetId, pending)))
      .all();

    if (directReplies.length > 0) {
      directReplies.forEach(r => allDescendantIds.push(r.id));
      pending = directReplies.map(r => r.id);
    } else {
      break;
    }
  }

  if (allDescendantIds.length > 0) {
    await db.delete(notifications).where(and(
      eq(notifications.targetType, 'comment'),
      inArray(notifications.targetId, allDescendantIds),
    ));
    await db.delete(commentLikes).where(inArray(commentLikes.commentId, allDescendantIds));
  }

  await db.delete(comments).where(inArray(comments.id, allDescendantIds));

  return NextResponse.json({ success: true });
}
