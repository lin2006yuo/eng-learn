'use client';

import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { usePostModalContext } from '@/shared/hooks/PostModalContext';
import { PostDetail } from '@/features/post/components/PostDetail';
import { PostCommentsSection } from '@/features/post/components/PostCommentsSection';
import { PostEmptyState } from '@/features/post/components/PostEmptyState';
import { usePostDetail } from '@/features/post/hooks/usePostDetail';

export function ModalPostDetail() {
  const { isModalOpen, targetId, closeModal } = usePostModalContext();
  const postId = targetId || '';
  const { data, isLoading, isError, refetch } = usePostDetail(postId);

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
          <div className="post-modal-detail flex h-full flex-col">
            <div className="post-modal-detail-header flex flex-shrink-0 items-center gap-3 border-b border-gray-100 bg-background/95 px-5 py-3 backdrop-blur-sm">
              <button
                onClick={closeModal}
                className="post-modal-detail-back flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-primary shadow-card"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <p className="text-sm text-text-secondary">帖子详情</p>
                <h1 className="text-2xl font-bold text-text-primary">帖子内容</h1>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-10 pt-6">
              {isLoading ? (
                <div className="py-20 text-center text-text-secondary">加载帖子详情中...</div>
              ) : null}

              {!isLoading && isError ? (
                <PostEmptyState
                  title="帖子不可用"
                  description="这个帖子可能已下线或暂时无法访问。"
                  actionText="重试"
                  onAction={() => refetch()}
                />
              ) : null}

              {!isLoading && !isError && data ? (
                <div className="space-y-4">
                  <PostDetail post={data} />
                  <PostCommentsSection postId={postId} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
