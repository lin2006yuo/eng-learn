'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ArticleEmptyState } from '@/features/article/components/ArticleEmptyState';
import { ArticleList } from '@/features/article/components/ArticleList';
import { useArticleList } from '@/features/article/hooks/useArticleList';
import { Button } from '@/shared/components';

export const dynamic = 'force-dynamic';

export default function ArticlesPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useArticleList();

  return (
    <div className="article-page-container min-h-screen bg-background px-5 pb-10 pt-6">
      <div className="article-page-header mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="article-back-btn flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-primary shadow-card"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-sm text-text-secondary">分享学习心得与资源</p>
          <h1 className="text-3xl font-bold text-text-primary">文章分享</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="article-loading-container py-20 text-center text-text-secondary">加载文章中...</div>
      ) : null}

      {!isLoading && isError ? (
        <ArticleEmptyState
          title="加载失败"
          description="文章列表暂时不可用，请稍后重试。"
          actionText="重新加载"
          onAction={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && data?.data.length === 0 ? (
        <ArticleEmptyState description="发布文章后，这里会展示最新内容。" />
      ) : null}

      {!isLoading && !isError && data && data.data.length > 0 ? (
        <>
          <div className="article-page-count mb-4 text-sm text-text-secondary">
            已发布文章 <span className="font-semibold text-text-primary">({data.totalCount})</span>
          </div>
          <ArticleList articles={data.data} />
        </>
      ) : null}

      <div className="article-page-footer mt-8 flex justify-center">
        <Button variant="ghost" onClick={() => router.push('/')}>返回广场</Button>
      </div>
    </div>
  );
}
