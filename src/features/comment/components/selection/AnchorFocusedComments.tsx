'use client';

import { CommentCarousel } from '@/features/comment/components/selection/CommentCarousel';
import { CommentItem } from '@/features/comment/components/CommentItem';
import type { Comment, RootType } from '@/features/comment/types';

interface AnchorFocusedCommentsProps {
  resolvedComments: Comment[];
  focusedCommentIds: string[];
  focusedCommentIndex: number;
  targetId: string;
  rootType: RootType;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

function getCommentById(resolvedComments: Comment[], id: string): Comment | null {
  return resolvedComments.find((c) => c.id === id) || null;
}

export function AnchorFocusedComments(props: AnchorFocusedCommentsProps) {
  const {
    resolvedComments,
    focusedCommentIds,
    focusedCommentIndex,
    targetId,
    rootType,
    onIndexChange,
    onClose,
  } = props;

  const totalCount = focusedCommentIds.length;
  if (totalCount === 0) return null;

  const safeIndex = Math.min(focusedCommentIndex, totalCount - 1);
  const commentId = focusedCommentIds[safeIndex];
  const comment = getCommentById(resolvedComments, commentId);

  return (
    <div
      className="anchor-focused-comments mt-3 rounded-subtle-card border border-primary/20 bg-white p-3"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-text-primary">片段评论</p>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 text-text-tertiary"
        >
          ×
        </button>
      </div>

      <CommentCarousel
        currentIndex={safeIndex}
        totalCount={totalCount}
        onPrev={() => onIndexChange((safeIndex - 1 + totalCount) % totalCount)}
        onNext={() => onIndexChange((safeIndex + 1) % totalCount)}
      />

      {comment ? (
        <div className="anchor-focused-comments-item">
          <CommentItem comment={comment} targetId={targetId} rootType={rootType} />
        </div>
      ) : null}
    </div>
  );
}
