'use client';

import { useModalRouteContext } from '@/shared/hooks/ModalRouteContext';
import { CommentsModal } from '@/features/comment/components/CommentsModal';

export function ModalComments() {
  const { isModalOpen, activeModalType, activeTargetId, closeModal } = useModalRouteContext();

  if (!isModalOpen || activeModalType !== 'comments' || !activeTargetId) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto h-full">
          <CommentsModal targetId={activeTargetId} />
        </div>
      </div>
    </div>
  );
}
