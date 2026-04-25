import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { fetchPostById, incrementPostViewCount } from '@/features/post/queries';
import type { PostFormValues } from '@/features/post/types';
import { getDb } from '@/lib/db';
import { posts } from '@/lib/db/posts-schema';
import { requireOwnerOrAdmin } from '../_auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const scope = new URL(request.url).searchParams.get('scope');
  const includeUnpublished = scope === 'manage';

  if (includeUnpublished) {
    const authResult = await requireOwnerOrAdmin(request, postId);
    if (!authResult.ok) {
      return authResult.response;
    }
  }

  const post = await fetchPostById(postId, includeUnpublished);

  if (!post) {
    return NextResponse.json({ error: '帖子不存在或不可访问' }, { status: 404 });
  }

  if (!includeUnpublished) {
    await incrementPostViewCount(postId);
  }

  return NextResponse.json({ data: post });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const authResult = await requireOwnerOrAdmin(request, postId);
  if (!authResult.ok) {
    return authResult.response;
  }

  const body = (await request.json().catch(() => null)) as Partial<PostFormValues> | null;
  if (!body) {
    return NextResponse.json({ error: '请求参数错误' }, { status: 400 });
  }

  const db = getDb();
  const now = new Date();
  const status = body.status || 'draft';
  const result = await db
    .update(posts)
    .set({
      title: body.title?.trim() || '未命名帖子',
      content: body.content?.trim() || '请补充帖子正文',
      status,
      publishedAt: status === 'published' ? now : null,
      updatedAt: now,
    })
    .where(eq(posts.id, postId))
    .returning({ id: posts.id });

  if (!result[0]) {
    return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
  }

  return NextResponse.json({ data: { id: postId } });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const authResult = await requireOwnerOrAdmin(request, postId);
  if (!authResult.ok) {
    return authResult.response;
  }

  const db = getDb();
  const result = await db
    .delete(posts)
    .where(eq(posts.id, postId))
    .returning({ id: posts.id });

  if (!result[0]) {
    return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
