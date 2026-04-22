'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ArticleDetail } from '@/features/article/components/ArticleDetail';
import { ArticleCommentsSection } from '@/features/article/components/ArticleCommentsSection';
import { ArticleEmptyState } from '@/features/article/components/ArticleEmptyState';
import { useArticleDetail } from '@/features/article/hooks/useArticleDetail';

export const dynamic = 'force-dynamic';

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams<{ articleId: string }>();
  const articleId = params.articleId;
  const { data, isLoading, isError, refetch } = useArticleDetail(articleId);

  return (
    <div className="article-detail-page min-h-screen bg-background px-5 pb-10 pt-6">
      <div className="article-detail-page-header mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="article-detail-back-btn flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-primary shadow-card"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-sm text-text-secondary">文章详情</p>
          <h1 className="text-2xl font-bold text-text-primary">沉浸阅读</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="article-detail-loading py-20 text-center text-text-secondary">加载文章详情中...</div>
      ) : null}

      {!isLoading && isError ? (
        <ArticleEmptyState
          title="文章不可用"
          description="这篇文章可能已下线或暂时无法访问。"
          actionText="重试"
          onAction={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && data ? (
        <div className="space-y-4">
          <ArticleDetail article={data} />
          <ArticleCommentsSection articleId={articleId} />
        </div>
      ) : null}
    </div>
  );
}
