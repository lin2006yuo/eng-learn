'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
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
        className="w-full max-w-[398px] overflow-hidden rounded-modal border border-primary/20 bg-white shadow-card"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <p className="text-sm font-medium text-text-primary">片段评论</p>
          <button
            type="button"
            onClick={closeComposer}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

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
