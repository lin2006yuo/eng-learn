'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CommentItem } from '@/features/comment/components/CommentItem';
import type { MergedInterval } from '@/features/comment/utils/anchorMerge';
import type { Comment, RootType } from '@/features/comment/types';
import { useAnchorHighlight, useScrollToActiveAnchor } from '@/features/comment/context/AnchorHighlightContext';

interface AnchorFocusedCommentsProps {
  resolvedComments: Comment[];
  segments: MergedInterval[];
  activeSegmentIndex: number | null;
  activeCommentIndex: number;
  targetId: string;
  rootType: RootType;
  blockId: string;
  onCommentChange: (index: number) => void;
  onSegmentChange: (index: number) => void;
  onClose: () => void;
}

function getCommentById(resolvedComments: Comment[], id: string): Comment | null {
  return resolvedComments.find((c) => c.id === id) || null;
}

function getSegmentIndexByCommentIndex(
  segments: MergedInterval[],
  commentIndex: number
): number {
  let accumulatedCount = 0;
  for (let i = 0; i < segments.length; i++) {
    const segmentCommentCount = segments[i].commentIds.length;
    if (commentIndex < accumulatedCount + segmentCommentCount) {
      return i;
    }
    accumulatedCount += segmentCommentCount;
  }
  return 0;
}

export function AnchorFocusedComments(props: AnchorFocusedCommentsProps) {
  const {
    resolvedComments,
    segments,
    activeSegmentIndex,
    activeCommentIndex,
    targetId,
    rootType,
    blockId,
    onCommentChange,
    onSegmentChange,
    onClose,
  } = props;
  const drawerRef = useRef<HTMLDivElement>(null);
  const { setActiveAnchor, clearActiveAnchor } = useAnchorHighlight();
  const lastProcessedCommentIndexRef = useRef<number | null>(null);

  useScrollToActiveAnchor(activeSegmentIndex !== null);

  useEffect(() => {
    if (activeSegmentIndex === null) {
      clearActiveAnchor();
      return;
    }

    setActiveAnchor(blockId, activeSegmentIndex);

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
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [activeSegmentIndex, blockId, setActiveAnchor, clearActiveAnchor, onClose]);

  useEffect(() => {
    if (lastProcessedCommentIndexRef.current === null) {
      lastProcessedCommentIndexRef.current = activeCommentIndex;
      return;
    }

    if (lastProcessedCommentIndexRef.current !== activeCommentIndex) {
      const newSegmentIndex = getSegmentIndexByCommentIndex(segments, activeCommentIndex);
      if (newSegmentIndex !== activeSegmentIndex) {
        onSegmentChange(newSegmentIndex);
      }
      lastProcessedCommentIndexRef.current = activeCommentIndex;
    }
  }, [activeCommentIndex, segments, activeSegmentIndex, onSegmentChange]);

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

  const handleCommentChange = (newCommentIndex: number) => {
    onCommentChange(newCommentIndex);
  };

  return createPortal(
    <div className="anchor-focused-comments-overlay fixed inset-0 z-[130]" onClick={onClose}>
      <div className="anchor-focused-comments-wrapper absolute inset-x-0 bottom-0 mx-auto w-full max-w-[430px]">
        <div
          ref={drawerRef}
          className="anchor-focused-comments bg-[#FAFAFA] border-t border-[#E5E5EA]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="anchor-focused-comments-header flex items-center justify-between px-5 py-3 border-b border-[#E5E5EA]">
            <h2 className="anchor-focused-comments-title text-[17px] font-semibold text-[#1D1D1F] truncate flex-1">{title}</h2>
            <div className="anchor-focused-comments-controls flex items-center gap-3">
              {totalCommentCount > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleCommentChange((safeCommentIndex - 1 + totalCommentCount) % totalCommentCount)}
                    className="anchor-focused-comments-prev text-[13px] text-[#007AFF] active:opacity-50 transition-opacity"
                  >
                    上一条
                  </button>
                  <span className="anchor-focused-comments-counter text-[13px] text-[#6E6E73]">
                    {safeCommentIndex + 1}/{totalCommentCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCommentChange((safeCommentIndex + 1) % totalCommentCount)}
                    className="anchor-focused-comments-next text-[13px] text-[#007AFF] active:opacity-50 transition-opacity"
                  >
                    下一条
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onClose}
                className="anchor-focused-comments-close text-[13px] text-[#6E6E73] active:opacity-50 transition-opacity ml-2"
              >
                关闭
              </button>
            </div>
          </div>

          <div className="anchor-focused-comments-body px-5 py-4">
            <CommentItem
              comment={activeComment}
              targetId={targetId}
              rootType={rootType}
              hideAnchorSummary
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
