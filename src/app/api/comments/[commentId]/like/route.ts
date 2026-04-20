import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { commentLikes } from '@/lib/db/patterns-schema';
import { eq, and, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';

function generateId(): string {
  return `cl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * POST /api/comments/:commentId/like
 *
 * Auth: 需要登录
 *
 * Behavior: 切换点赞状态 (已赞→取消, 未赞→点赞)
 *
 * Response:
 * - `data.isLiked`  当前用户是否已点赞
 * - `data.likes`    当前点赞总数
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const db = getDb();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { commentId } = await params;

  const [existing] = await db
    .select({ id: commentLikes.id })
    .from(commentLikes)
    .where(and(
      eq(commentLikes.commentId, commentId),
      eq(commentLikes.userId, session.user.id)
    ))
    .limit(1);

  if (existing) {
    await db.delete(commentLikes).where(eq(commentLikes.id, existing.id));
  } else {
    await db.insert(commentLikes).values({
      id: generateId(),
      userId: session.user.id,
      commentId,
      createdAt: new Date(),
    });
  }

  const [likeCountRow] = await db
    .select({ count: count() })
    .from(commentLikes)
    .where(eq(commentLikes.commentId, commentId));

  return NextResponse.json({
    data: {
      isLiked: !existing,
      likes: likeCountRow?.count || 0,
    },
  });
}
