'use client';

import { usePatternCommentModalContext } from '@/shared/hooks/PatternCommentModalContext';
import { CommentsModal } from '@/features/comment/components/CommentsModal';

export function ModalComments() {
  const { isModalOpen, targetId, closeModal } = usePatternCommentModalContext();

  if (!isModalOpen || !targetId) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto h-full">
          <CommentsModal targetId={targetId} />
        </div>
      </div>
    </div>
  );
}
