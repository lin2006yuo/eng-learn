import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ArticleCreateForm } from '@/features/article/components/ArticleCreateForm';

export default async function NewArticlePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect('/login?from=/articles/new');
  }

  const authorName = (session.user as { nickname?: string; name?: string }).nickname || session.user.name || '你';

  return (
    <div className="new-article-page min-h-screen bg-background px-5 py-6 pb-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/articles" className="text-sm font-semibold text-primary">
            ← 返回文章广场
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-text-primary">发布文章</h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            发布一篇属于你的英语文章，分享表达、练习成果或学习体验，让更多同学一起交流。
          </p>
        </div>
        <ArticleCreateForm authorName={authorName} />
      </div>
    </div>
  );
}
