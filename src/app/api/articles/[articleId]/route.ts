import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { fetchArticleById } from '@/features/article/queries';
import type { ArticleFormValues } from '@/features/article/types';
import { getDb } from '@/lib/db';
import { articles } from '@/lib/db/articles-schema';
import { requireOwnerOrAdmin } from '../_auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  const { articleId } = await params;
  const scope = new URL(request.url).searchParams.get('scope');
  const includeUnpublished = scope === 'manage';

  if (includeUnpublished) {
    const authResult = await requireOwnerOrAdmin(request, articleId);
    if (!authResult.ok) {
      return authResult.response;
    }
  }

  const article = await fetchArticleById(articleId, includeUnpublished);

  if (!article) {
    return NextResponse.json({ error: '文章不存在或不可访问' }, { status: 404 });
  }

  return NextResponse.json({ data: article });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  const { articleId } = await params;
  const authResult = await requireOwnerOrAdmin(request, articleId);
  if (!authResult.ok) {
    return authResult.response;
  }

  const body = (await request.json().catch(() => null)) as Partial<ArticleFormValues> | null;
  if (!body) {
    return NextResponse.json({ error: '请求参数错误' }, { status: 400 });
  }

  const db = getDb();
  const now = new Date();
  const status = body.status || 'draft';
  const result = await db
    .update(articles)
    .set({
      title: body.title?.trim() || '未命名文章',
      summary: body.summary?.trim() || '请补充文章摘要',
      content: body.content?.trim() || '请补充文章正文',
      status,
      publishedAt: status === 'published' ? now : null,
      updatedAt: now,
    })
    .where(eq(articles.id, articleId))
    .returning({ id: articles.id });

  if (!result[0]) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  }

  return NextResponse.json({ data: { id: articleId } });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  const { articleId } = await params;
  const authResult = await requireOwnerOrAdmin(request, articleId);
  if (!authResult.ok) {
    return authResult.response;
  }

  const db = getDb();
  const result = await db
    .delete(articles)
    .where(eq(articles.id, articleId))
    .returning({ id: articles.id });

  if (!result[0]) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
