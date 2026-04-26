'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArticleDetailHeader } from '@/features/article/components/ArticleDetailHeader';
import { ArticleDetailShell } from '@/features/article/components/ArticleDetailShell';
import { useArticleDetail } from '@/features/article/hooks/useArticleDetail';

export const dynamic = 'force-dynamic';

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams<{ articleId: string }>();
  const articleId = params.articleId;
  const { data, isLoading, isError, refetch } = useArticleDetail(articleId);

  return (
    <div className="article-detail-page min-h-screen bg-[#FAFAFA] pb-10 pt-6">
      <div className="article-detail-page-header px-5">
        <ArticleDetailHeader onBack={() => router.back()} />
      </div>

      <ArticleDetailShell
        article={data}
        articleId={articleId}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      />
    </div>
  );
}
