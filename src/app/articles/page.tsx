'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ArticleEmptyState } from '@/features/article/components/ArticleEmptyState';
import { ArticleList } from '@/features/article/components/ArticleList';
import { useArticleList } from '@/features/article/hooks/useArticleList';

export const dynamic = 'force-dynamic';

export default function ArticlesPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useArticleList();

  return (
    <div className="article-page-container min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="article-page-header sticky top-0 z-40 bg-[#FAFAFA]/95 backdrop-blur-sm px-5 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="article-back-btn w-10 h-10 flex items-center justify-center active:opacity-50 transition-opacity"
        >
          <ArrowLeft size={20} className="text-[#007AFF]" />
        </button>
        <h2 className="text-[17px] font-semibold text-[#1D1D1F]">文章分享</h2>
      </div>

      {/* Subtitle */}
      <div className="article-page-subtitle px-5 pb-3 pt-1">
        <p className="text-[14px] text-[#6E6E73]">分享学习心得与资源</p>
      </div>

      {/* Content */}
      <div className="article-page-content px-5 pb-10">
        {isLoading ? (
          <div className="article-loading-container py-20 text-center text-[#6E6E73] text-[15px]">
            加载文章中...
          </div>
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
            <div className="article-page-count mb-3 text-[14px] text-[#6E6E73]">
              已发布文章 <span className="font-medium text-[#1D1D1F]">({data.totalCount})</span>
            </div>
            <ArticleList articles={data.data} />
          </>
        ) : null}
      </div>
    </div>
  );
}
