'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CommentItem } from '@/features/comment/components/CommentItem';
import type { MergedInterval } from '@/features/comment/utils/anchorMerge';
import type { Comment, RootType } from '@/features/comment/types';

interface AnchorFocusedCommentsProps {
  resolvedComments: Comment[];
  segments: MergedInterval[];
  activeSegmentIndex: number | null;
  activeCommentIndex: number;
  targetId: string;
  rootType: RootType;
  onCommentChange: (index: number) => void;
  onClose: () => void;
}

function getCommentById(resolvedComments: Comment[], id: string): Comment | null {
  return resolvedComments.find((c) => c.id === id) || null;
}

export function AnchorFocusedComments(props: AnchorFocusedCommentsProps) {
  const {
    resolvedComments,
    segments,
    activeSegmentIndex,
    activeCommentIndex,
    targetId,
    rootType,
    onCommentChange,
    onClose,
  } = props;
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSegmentIndex === null) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (drawerRef.current?.contains(target)) return;
      if (target.closest('.comment-anchor-underline')) return;
      onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [activeSegmentIndex, onClose]);

  if (activeSegmentIndex === null) return null;

  const blockComments = segments.flatMap((segment) => (
    segment.commentIds
      .map((commentId) => getCommentById(resolvedComments, commentId))
      .filter((comment): comment is Comment => Boolean(comment))
  ));

  if (blockComments.length === 0) return null;

  const totalCommentCount = blockComments.length;
  const safeCommentIndex = Math.min(activeCommentIndex, totalCommentCount - 1);
  const activeComment = blockComments[safeCommentIndex];
  if (!activeComment) return null;

  const title = activeComment.anchor?.selectedText || '评论';

  return createPortal(
    <div className="fixed inset-0 z-[130] pointer-events-none">
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[430px] pointer-events-none">
        <div
          ref={drawerRef}
          className="anchor-focused-comments pointer-events-auto rounded-t-modal bg-white shadow-card"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex justify-center px-4 pt-3">
            <span className="h-1 w-10 rounded-full bg-gray-200" />
          </div>

          <div className="border-b border-gray-100 px-4 pb-3 pt-2">
            {totalCommentCount > 1 ? (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onCommentChange((safeCommentIndex - 1 + totalCommentCount) % totalCommentCount)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <ChevronLeft size={16} className="text-text-secondary" />
                </button>

                <div className="min-w-0 flex-1 text-center">
                  <div className="mx-auto flex max-w-[280px] items-center justify-center gap-2 text-center">
                    <h2 className="truncate text-base font-semibold text-text-primary">{title}</h2>
                    <p className="shrink-0 text-xs text-text-tertiary">
                      {safeCommentIndex + 1} / {totalCommentCount}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onCommentChange((safeCommentIndex + 1) % totalCommentCount)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <ChevronRight size={16} className="text-text-secondary" />
                </button>
              </div>
            ) : (
              <h2 className="text-center text-base font-semibold text-text-primary">{title}</h2>
            )}
          </div>

          <div className="px-4 pb-4 pt-3">
            <div className="anchor-focused-comments-item max-h-[65vh] overflow-y-auto pr-1">
              <CommentItem
                comment={activeComment}
                targetId={targetId}
                rootType={rootType}
                isFocused
                hideAnchorSummary
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
