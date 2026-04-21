import React from 'react';
import Link from 'next/link';
import { BookText, PenSquare } from 'lucide-react';
import { ArticleList } from '@/features/article/components/ArticleList';
import { listArticles } from '@/features/article/queries';

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await listArticles();

  return (
    <div className="articles-page min-h-screen bg-background px-5 py-6 pb-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="articles-header flex items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm font-semibold text-primary">
              ← 返回学习广场
            </Link>
            <h1 className="mt-3 text-3xl font-bold text-text-primary">文章分享</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              浏览大家发布的英语文章、学习心得与表达练习，像刷学习社区一样轻松交流。
            </p>
          </div>
          <Link
            href="/articles/new"
            className="inline-flex items-center gap-2 rounded-badge bg-primary px-5 py-3 font-semibold text-white shadow-md"
          >
            <PenSquare size={18} />
            写文章
          </Link>
        </div>

        <div className="articles-hero rounded-card bg-gradient-to-br from-primary via-primary-dark to-emerald-600 p-6 text-white shadow-card">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-subtle-card bg-white/20">
            <BookText size={28} />
          </div>
          <h2 className="text-2xl font-bold">把英语学习写出来</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
            这里适合分享英语短文、写作练习、学习方法和阅读感想。发布后，其他学习者可以直接在文章下评论交流。
          </p>
        </div>

        {articles.length > 0 ? (
          <ArticleList articles={articles} />
        ) : (
          <div className="articles-empty rounded-card bg-white p-10 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-full bg-primary/10 text-3xl">
              📝
            </div>
            <h3 className="text-xl font-bold text-text-primary">还没有文章</h3>
            <p className="mt-2 text-sm text-text-secondary">你可以成为第一位分享英语文章的同学。</p>
          </div>
        )}
      </div>
    </div>
  );
}
