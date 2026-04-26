import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronDown } from 'lucide-react';
import { ExampleItem } from './ExampleItem';
import { FavoriteButton } from '@/features/favorite/components/FavoriteButton';
import { CommentPreview } from '@/features/comment/components/CommentPreview';
import { usePatternCommentModalContext } from '@/shared/hooks/PatternCommentModalContext';
import type { Pattern } from '@/shared/types';

interface PatternCardProps {
  pattern: Pattern;
  index: number;
  isLast?: boolean;
}

function commentSummaryToPreview(summary?: Pattern['commentSummary']) {
  if (!summary?.topComments?.length) return [];

  return summary.topComments.map((c) => ({
    id: c.id,
    patternId: '',
    userId: c.userId,
    userName: c.nickname,
    content: c.content,
    createdAt: c.createdAt,
    likes: c.likes,
    targetType: 'pattern' as const,
    targetId: '',
    rootType: 'pattern' as const,
    rootId: c.id,
  }));
}

export function PatternCard({ pattern, index, isLast }: PatternCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { openModal } = usePatternCommentModalContext();

  const summary = pattern.commentSummary;
  const commentCount = summary?.totalCount || 0;
  const commentPreview = commentSummaryToPreview(summary);

  const handleCommentClick = () => {
    openModal(pattern.id);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`py-4 ${!isLast ? 'border-b border-[#E5E5EA]' : ''}`}>
      {/* Pattern Header */}
      <div
        className="flex items-start gap-3.5 cursor-pointer select-none"
        onClick={toggleExpand}
      >
        <span className="text-[28px] leading-none flex-shrink-0">{pattern.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[18px] font-semibold text-[#1D1D1F] tracking-tight">
            {pattern.title}
          </h3>
          <p className="text-[14px] text-[#6E6E73] mt-0.5">{pattern.translation}</p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-1"
        >
          <ChevronDown size={18} className="text-[#C7C7CC]" />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Examples */}
            <div className="space-y-1 mt-2 ml-[44px]">
              {pattern.examples.map((example, idx) => (
                <ExampleItem
                  key={example.id}
                  example={example}
                  patternId={pattern.id}
                  index={idx}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 mt-2 ml-[44px]">
              <FavoriteButton patternId={pattern.id} />
              <span className="text-[#C7C7CC] text-[14px]">·</span>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleCommentClick}
                className="flex items-center gap-1 text-[#6E6E73] text-[14px] font-medium active:text-[#1D1D1F] transition-colors"
              >
                <MessageCircle size={14} />
                {commentCount > 0 ? `评论 (${commentCount})` : '评论'}
              </motion.button>
            </div>

            <div className="mt-3 ml-[44px] -mr-3">
              <CommentPreview
                comments={commentPreview}
                onClick={handleCommentClick}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
