import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { articles } from '@/lib/db/articles-schema';
import { createArticleSummary } from '@/features/article/article-utils';
import { getArticleById, listArticles } from '@/features/article/queries';

function generateArticleId() {
  return `article-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function validateArticleInput(title: unknown, content: unknown) {
  if (typeof title !== 'string' || typeof content !== 'string') {
    return '参数错误';
  }

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();

  if (trimmedTitle.length < 3 || trimmedTitle.length > 80) {
    return '标题长度需在 3 到 80 个字符之间';
  }

  if (trimmedContent.length < 120 || trimmedContent.length > 12000) {
    return '正文长度需在 120 到 12000 个字符之间';
  }

  return null;
}

export async function GET() {
  const data = await listArticles();
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const body = await request.json();
  const validationError = validateArticleInput(body.title, body.content);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const db = getDb();
  const articleId = generateArticleId();
  const content = body.content.trim();
  await db.insert(articles).values({
    id: articleId,
    userId: session.user.id,
    title: body.title.trim(),
    summary: createArticleSummary(content),
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const createdArticle = await getArticleById(articleId);
  return NextResponse.json({ data: createdArticle }, { status: 201 });
}
