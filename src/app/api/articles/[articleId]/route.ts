import { NextResponse } from 'next/server';
import { getArticleById } from '@/features/article/queries';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ articleId: string }> }
) {
  const { articleId } = await params;
  const data = await getArticleById(articleId);

  if (!data) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  }

  return NextResponse.json({ data });
}
