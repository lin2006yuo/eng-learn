'use client';

import { useEffect } from 'react';
import { usePostModalContext } from '@/shared/hooks/PostModalContext';
import { PostDetailHeader } from '@/features/post/components/PostDetailHeader';
import { PostDetailShell } from '@/features/post/components/PostDetailShell';
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
        <div className="pointer-events-auto mx-auto h-full max-w-[430px] bg-[#FAFAFA]">
          <div className="post-modal-detail flex h-full flex-col">
            <div className="post-modal-detail-header flex flex-shrink-0 items-center bg-[#FAFAFA]/95 px-5 backdrop-blur-sm">
              <PostDetailHeader onBack={closeModal} />
            </div>

            <div className="flex-1 overflow-y-auto pb-10 pt-4">
              <PostDetailShell
                post={data}
                postId={postId}
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
