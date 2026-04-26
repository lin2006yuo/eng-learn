'use client';

import { Heart, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePatternCommentModalContext } from '@/shared/hooks/PatternCommentModalContext';
import type { Comment } from '@/features/comment/types';
import { formatRelativeTime } from '@/features/comment/store/commentStore';

interface MyCommentItemProps {
  comment: Comment;
  isLast?: boolean;
}

const rootTypeRoutes: Record<string, (rootId: string) => string | null> = {
  pattern: () => null,
  article: (rootId) => `/articles/${rootId}`,
  post: () => null,
  note: () => null,
};

export function MyCommentItem({ comment, isLast = false }: MyCommentItemProps) {
  const router = useRouter();
  const { openModal } = usePatternCommentModalContext();

  const handleRootClick = () => {
    if (comment.rootType === 'pattern') {
      openModal(comment.rootId);
      return;
    }

    const route = rootTypeRoutes[comment.rootType]?.(comment.rootId);
    if (route) {
      router.push(route);
    }
  };

  const hasReplies = comment.replyCount && comment.replyCount > 0;

  return (
    <div className={`mycomment-item px-4 py-4 ${isLast ? '' : 'border-b border-[#E5E5EA]'}`}>
      <div className="mycomment-item-header flex items-center gap-1.5 mb-2">
        <span className="text-[13px] text-[#6E6E73]">在</span>
        <button
          onClick={handleRootClick}
          className="mycomment-item-target text-[13px] font-medium text-[#007AFF] active:opacity-50 transition-opacity truncate max-w-[180px]"
        >
          {comment.rootId}
        </button>
        <span className="text-[13px] text-[#6E6E73]">下评论</span>
      </div>

      <p className="mycomment-item-content text-[15px] text-[#1D1D1F] leading-snug mb-3">
        {comment.content}
      </p>

      <div className="mycomment-item-meta flex items-center gap-4">
        <span className="text-[13px] text-[#6E6E73]">
          {formatRelativeTime(comment.createdAt)}
        </span>

        <div className="flex items-center gap-1 text-[13px] text-[#6E6E73]">
          <Heart size={13} className="text-[#C7C7CC]" />
          <span>{comment.likes > 0 ? comment.likes : '0'}</span>
        </div>

        {hasReplies && (
          <button
            onClick={handleRootClick}
            className="mycomment-item-replies flex items-center gap-1 text-[13px] text-[#007AFF] active:opacity-50 transition-opacity"
          >
            <MessageSquare size={13} />
            <span>{comment.replyCount} 条回复</span>
          </button>
        )}
      </div>
    </div>
  );
}
