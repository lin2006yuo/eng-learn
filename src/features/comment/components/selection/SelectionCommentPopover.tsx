'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CommentInput } from '@/features/comment/components/CommentInput';
import { useSelectionStore } from '@/features/comment/store/selectionStore';

export function SelectionCommentPopover() {
  const {
    composerAnchor,
    composerPosition,
    closeComposer,
  } = useSelectionStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!composerAnchor) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popoverRef.current && !popoverRef.current.contains(target)) {
        closeComposer();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeComposer();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeComposer, composerAnchor]);

  if (!composerAnchor || !composerPosition) return null;

  return createPortal(
    <div
      className="comment-selection-composer fixed inset-x-0 z-[125] flex justify-center px-4"
      style={{ top: composerPosition.y }}
    >
      <div
        ref={popoverRef}
        className="comment-selection-composer-card w-full max-w-[398px] rounded-[12px] bg-white shadow-lg px-4 py-3"
      >
        <CommentInput
          rootId={composerAnchor.rootId}
          rootType={composerAnchor.rootType}
          anchor={composerAnchor}
          autoFocus
          variant="floating"
          onReplySuccess={closeComposer}
        />
      </div>
    </div>,
    document.body,
  );
}
