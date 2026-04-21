'use client';

import type { Comment } from '@/features/comment/types';

interface CommentAnchorSummaryProps {
  comment: Comment;
}

export function CommentAnchorSummary(props: CommentAnchorSummaryProps) {
  const { comment } = props;

  if (!comment.anchor) return null;

  const statusTextMap = {
    active: '已定位',
    relocated: '已重定位',
    orphaned: '未定位',
  } as const;

  return (
    <div className="comment-anchor-summary mb-3 ml-12 rounded-subtle-card bg-primary/10 px-3 py-2 text-sm text-text-primary">
      <span className="mr-2 rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium">
        {statusTextMap[comment.anchor.anchorStatus]}
      </span>
      <span className="font-medium">关联片段:</span> "{comment.anchor.selectedText}"
    </div>
  );
}
