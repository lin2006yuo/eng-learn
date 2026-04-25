import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { posts } from '@/lib/db/posts-schema';

type AuthResult =
  | { ok: true; userId: string; role?: string }
  | { ok: false; response: NextResponse };

export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return { ok: false, response: NextResponse.json({ error: '请先登录' }, { status: 401 }) };
  }
  return { ok: true, userId: session.user.id, role: (session.user as any).role };
}

export async function requireOwnerOrAdmin(
  request: NextRequest,
  postId: string
): Promise<AuthResult> {
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return authResult;
  }

  if (authResult.role === 'admin') {
    return authResult;
  }

  const db = getDb();
  const [row] = await db
    .select({ authorId: posts.authorId })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!row) {
    return { ok: false, response: NextResponse.json({ error: '帖子不存在' }, { status: 404 }) };
  }

  if (row.authorId !== authResult.userId) {
    return { ok: false, response: NextResponse.json({ error: '无帖子操作权限' }, { status: 403 }) };
  }

  return authResult;
}
