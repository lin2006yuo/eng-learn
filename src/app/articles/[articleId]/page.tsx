import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleDetailView } from '@/features/article/components/ArticleDetailView';
import { getArticleById } from '@/features/article/queries';

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await params;
  const article = await getArticleById(articleId);

  if (!article) {
    notFound();
  }

  return (
    <div className="article-page min-h-screen bg-background px-5 py-6 pb-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="article-page-header flex items-center justify-between gap-4">
          <div>
            <Link href="/articles" className="text-sm font-semibold text-primary">
              ← 返回文章广场
            </Link>
            <p className="mt-2 text-sm text-text-secondary">沉浸阅读后，也欢迎在下方留言交流。</p>
          </div>
          <Link
            href="/articles/new"
            className="rounded-badge bg-white px-4 py-2 text-sm font-semibold text-primary shadow-card"
          >
            我也写一篇
          </Link>
        </div>
        <ArticleDetailView article={article} />
      </div>
    </div>
  );
}
