'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useArticleModalContext } from '@/shared/hooks/ArticleModalContext';
import { ArticleDetail } from '@/features/article/components/ArticleDetail';
import { ArticleCommentsSection } from '@/features/article/components/ArticleCommentsSection';
import { ArticleEmptyState } from '@/features/article/components/ArticleEmptyState';
import { useArticleDetail } from '@/features/article/hooks/useArticleDetail';

export function ModalArticleDetail() {
  const router = useRouter();
  const { isModalOpen, targetId, closeModal } = useArticleModalContext();
  const articleId = targetId || '';
  const { data, isLoading, isError, refetch } = useArticleDetail(articleId);

  useEffect(() => {
    if (!isModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen]);

  if (!isModalOpen || !targetId) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto mx-auto h-full max-w-[430px] bg-background">
          <div className="article-modal-detail flex h-full flex-col">
            <div className="article-modal-detail-header flex flex-shrink-0 items-center gap-3 border-b border-gray-100 bg-background/95 px-5 py-3 backdrop-blur-sm">
              <button
                onClick={closeModal}
                className="article-modal-detail-back flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-primary shadow-card"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <p className="text-sm text-text-secondary">文章详情</p>
                <h1 className="text-2xl font-bold text-text-primary">沉浸阅读</h1>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-10 pt-6">
              {isLoading ? (
                <div className="py-20 text-center text-text-secondary">加载文章详情中...</div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
