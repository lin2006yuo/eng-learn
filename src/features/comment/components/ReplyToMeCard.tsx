'use client';

import { Heart, Reply } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePatternCommentModalContext } from '@/shared/hooks/PatternCommentModalContext';
import type { Comment } from '@/features/comment/types';
import { formatRelativeTime } from '@/features/comment/store/commentStore';

interface ReplyToMeCardProps {
  comment: Comment;
  onReply?: (comment: Comment) => void;
}

const rootTypeRoutes: Record<string, (rootId: string) => string | null> = {
  pattern: (rootId) => null,
  article: (rootId) => `/articles/${rootId}`,
  post: (rootId) => null,
  note: (rootId) => null,
};

export function ReplyToMeCard({ comment, onReply }: ReplyToMeCardProps) {
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
  };

  const handleReplyClick = () => {
    onReply?.(comment);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-subtle-card p-4 shadow-card"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-secondary">
            {comment.userName.charAt(0)}
          </span>
        </div>
        <span className="text-sm font-medium text-text-primary">
          {comment.userName}
        </span>
        <span className="text-xs text-text-secondary">回复了你</span>
      </div>

      <div className="flex items-center gap-2 mb-2 ml-9">
        <span className="text-xs text-text-secondary">在</span>
        <button
          onClick={handleRootClick}
          className="text-xs font-medium text-primary hover:underline truncate max-w-[200px]"
        >
          {comment.rootId}
        </button>
      </div>

      <div className="ml-9 bg-gray-50 rounded-list p-3 mb-3">
        <p className="text-text-primary text-sm leading-relaxed">
          {comment.content}
        </p>
      </div>

      <div className="flex items-center justify-between ml-9">
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-tertiary">
            {formatRelativeTime(comment.createdAt)}
          </span>

          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <Heart size={12} />
            <span>{comment.likes > 0 ? comment.likes : '0'}</span>
          </div>
        </div>

        <button
          onClick={handleReplyClick}
          className="flex items-center gap-1 text-xs text-text-tertiary hover:text-primary transition-colors"
        >
          <Reply size={12} />
          回复
        </button>
      </div>
    </motion.div>
  );
}
