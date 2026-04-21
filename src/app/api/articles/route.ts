import { NextRequest, NextResponse } from 'next/server';
import { countAllArticles, countPublishedArticles, fetchManageArticles, fetchPublicArticles } from '@/features/article/queries';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { articles } from '@/lib/db/articles-schema';
import type { ArticleFormValues, ArticleStatus } from '@/features/article/types';

function parseListParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return {
    cursor: searchParams.get('cursor') || undefined,
    limit: Math.min(parseInt(searchParams.get('limit') || '20', 10), 50),
    scope: searchParams.get('scope') || 'public',
    status: (searchParams.get('status') as ArticleStatus | null) || undefined,
  };
}

async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return { error: NextResponse.json({ error: '请先登录' }, { status: 401 }) };
  }
  if ((session.user as typeof session.user & { role?: string }).role !== 'admin') {
    return { error: NextResponse.json({ error: '无文章管理权限' }, { status: 403 }) };
  }
  return { session };
}

export async function GET(request: NextRequest) {
  const params = parseListParams(request);
  if (params.scope === 'manage') {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return authResult.error;
    }

    const [data, totalCount] = await Promise.all([
      fetchManageArticles(params.status),
      countAllArticles(params.status),
    ]);

    return NextResponse.json({ data, totalCount, hasMore: false, nextCursor: undefined });
  }

  const [result, totalCount] = await Promise.all([
    fetchPublicArticles(params.cursor, params.limit),
    countPublishedArticles(),
  ]);

  return NextResponse.json({
    data: result.articles,
    totalCount,
    hasMore: result.hasMore,
    nextCursor: result.nextCursor,
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult.error) {
    return authResult.error;
  }

  const body = (await request.json().catch(() => null)) as Partial<ArticleFormValues> | null;
  const title = body?.title?.trim() || '未命名文章';
  const summary = body?.summary?.trim() || '请补充文章摘要';
  const content = body?.content?.trim() || '请补充文章正文';
  const status = body?.status || 'draft';
  const now = new Date();

  const db = getDb();
  const articleId = crypto.randomUUID();
  await db.insert(articles).values({
    id: articleId,
    title,
    summary,
    content,
    status,
    authorId: authResult.session!.user.id,
    publishedAt: status === 'published' ? now : null,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ data: { id: articleId } }, { status: 201 });
}
