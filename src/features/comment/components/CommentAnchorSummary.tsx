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
    <div className="comment-anchor-summary mb-3 rounded-[12px] bg-[#007AFF]/10 px-3 py-2 text-sm text-[#1D1D1F]">
      <span className="comment-anchor-status mr-2 rounded-full bg-[#FFFFFF]/80 px-2 py-0.5 text-xs font-medium">
        {statusTextMap[comment.anchor.anchorStatus]}
      </span>
      <span className="comment-anchor-label font-medium">关联片段:</span> "{comment.anchor.selectedText}"
    </div>
  );
}
