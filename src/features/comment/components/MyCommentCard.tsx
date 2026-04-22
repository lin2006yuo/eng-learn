'use client';

import { Heart, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePatternCommentModalContext } from '@/shared/hooks/PatternCommentModalContext';
import type { Comment } from '@/features/comment/types';
import { formatRelativeTime } from '@/features/comment/store/commentStore';
import { getPatternById } from '@/data/patterns';

interface MyCommentCardProps {
  comment: Comment;
}

const rootTypeRoutes: Record<string, (rootId: string) => string | null> = {
  pattern: (rootId) => null,
  article: (rootId) => `/articles/${rootId}`,
  post: (rootId) => null,
  note: (rootId) => null,
};

export function MyCommentCard({ comment }: MyCommentCardProps) {
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
      return;
    }

    // post 和 note 暂无对应页面，暂不跳转
  };

  const hasReplies = comment.replyCount && comment.replyCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-subtle-card p-4 shadow-card"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-text-secondary">在</span>
        <button
          onClick={handleRootClick}
          className="text-xs font-medium text-primary hover:underline truncate max-w-[200px]"
        >
          {comment.rootId}
        </button>
        <span className="text-xs text-text-secondary">下评论</span>
      </div>

      <p className="text-text-primary text-sm leading-relaxed mb-3">
        {comment.content}
      </p>

      <div className="flex items-center gap-3">
        <span className="text-xs text-text-tertiary">
          {formatRelativeTime(comment.createdAt)}
        </span>

        <div className="flex items-center gap-1 text-xs text-text-tertiary">
          <Heart size={12} />
          <span>{comment.likes > 0 ? comment.likes : '0'}</span>
        </div>

        {hasReplies && (
          <button
            onClick={handleRootClick}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <MessageSquare size={12} />
            <span>{comment.replyCount} 条回复</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
