import { NextRequest, NextResponse } from 'next/server';
import { countAllPosts, countPublishedPosts, fetchManagePosts, fetchPublicPosts } from '@/features/post/queries';
import { getDb } from '@/lib/db';
import { posts } from '@/lib/db/posts-schema';
import type { PostFormValues, PostStatus } from '@/features/post/types';
import { requireAuth } from './_auth';

function parseListParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return {
    cursor: searchParams.get('cursor') || undefined,
    limit: Math.min(parseInt(searchParams.get('limit') || '20', 10), 50),
    scope: searchParams.get('scope') || 'public',
    status: (searchParams.get('status') as PostStatus | null) || undefined,
  };
}

export async function GET(request: NextRequest) {
  const params = parseListParams(request);
  if (params.scope === 'manage') {
    const authResult = await requireAuth(request);
    if (!authResult.ok) {
      return authResult.response;
    }

    const userId = authResult.userId;
    const isAdmin = authResult.role === 'admin';

    const [data, totalCount] = await Promise.all([
      fetchManagePosts(params.status, isAdmin ? undefined : userId),
      countAllPosts(params.status, isAdmin ? undefined : userId),
    ]);

    return NextResponse.json({ data, totalCount, hasMore: false, nextCursor: undefined });
  }

  const [result, totalCount] = await Promise.all([
    fetchPublicPosts(params.cursor, params.limit),
    countPublishedPosts(),
  ]);

  return NextResponse.json({
    data: result.posts,
    totalCount,
    hasMore: result.hasMore,
    nextCursor: result.nextCursor,
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  const body = (await request.json().catch(() => null)) as Partial<PostFormValues> | null;
  const title = body?.title?.trim() || '未命名帖子';
  const content = body?.content?.trim() || '请补充帖子正文';
  const status = body?.status || 'draft';
  const now = new Date();

  const db = getDb();
  const postId = crypto.randomUUID();
  await db.insert(posts).values({
    id: postId,
    title,
    content,
    status,
    authorId: authResult.userId,
    publishedAt: status === 'published' ? now : null,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ data: { id: postId } }, { status: 201 });
}
