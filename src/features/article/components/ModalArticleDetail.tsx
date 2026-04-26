'use client';

import { useEffect } from 'react';
import { useArticleModalContext } from '@/shared/hooks/ArticleModalContext';
import { ArticleDetailHeader } from '@/features/article/components/ArticleDetailHeader';
import { ArticleDetailShell } from '@/features/article/components/ArticleDetailShell';
import { useArticleDetail } from '@/features/article/hooks/useArticleDetail';

export function ModalArticleDetail() {
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
        <div className="pointer-events-auto mx-auto h-full max-w-[430px] bg-[#FAFAFA]">
          <div className="article-modal-detail flex h-full flex-col">
            <div className="article-modal-detail-header flex flex-shrink-0 items-center bg-[#FAFAFA]/95 px-5 backdrop-blur-sm">
              <ArticleDetailHeader onBack={closeModal} />
            </div>

            <div className="flex-1 overflow-y-auto pb-10 pt-4">
              <ArticleDetailShell
                article={data}
                articleId={articleId}
                isLoading={isLoading}
                isError={isError}
                onRetry={refetch}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
