'use client';

import { Heart, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useModalRouteContext } from '@/shared/hooks/ModalRouteContext';
import type { Comment } from '@/features/comment/types';
import { formatRelativeTime } from '@/features/comment/store/commentStore';
import { getPatternById } from '@/data/patterns';

interface MyCommentCardProps {
  comment: Comment;
}

export function MyCommentCard({ comment }: MyCommentCardProps) {
  const { openModal } = useModalRouteContext();
  const pattern = getPatternById(comment.rootId);
  const patternTitle = pattern ? `${pattern.emoji} ${pattern.title}` : comment.rootId;

  const handlePatternClick = () => {
    openModal(comment.rootId);
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
          onClick={handlePatternClick}
          className="text-xs font-medium text-primary hover:underline truncate max-w-[200px]"
        >
          {patternTitle}
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
            onClick={handlePatternClick}
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
