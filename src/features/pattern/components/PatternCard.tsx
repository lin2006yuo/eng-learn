import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/shared/components/Card';
import { ExampleItem } from './ExampleItem';
import { FavoriteButton } from '@/features/favorite/components/FavoriteButton';
import { CommentPreview } from '@/features/comment/components/CommentPreview';
import { useModalRouteContext } from '@/shared/hooks/ModalRouteContext';
import type { Pattern } from '@/shared/types';

interface PatternCardProps {
  pattern: Pattern;
  index: number;
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

export function PatternCard({ pattern, index }: PatternCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);

  let openModal: ((modalType: 'comments', targetId: string) => void) | null = null;
  try {
    const modalContext = useModalRouteContext();
    openModal = modalContext.openModal;
  } catch {
    openModal = null;
  }

  const summary = pattern.commentSummary;
  const commentCount = summary?.totalCount || 0;
  const commentPreview = commentSummaryToPreview(summary);

  const patternNumber = pattern.id.replace('pattern-', '');

  const handleCommentClick = () => {
    if (openModal) {
      openModal('comments', pattern.id);
    } else {
      router.push(`/pattern/${pattern.id}/comments`);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card delay={index * 0.1} className="mb-4 relative overflow-hidden">
      <div className="absolute -top-3 -left-3 w-12 h-12 bg-primary/10 rounded-full flex items-end justify-end pb-2.5 pr-2.5">
        <span className="text-xs font-bold text-primary">{patternNumber}</span>
      </div>

      <div
        className="flex items-center gap-2 pl-6 cursor-pointer select-none"
        onClick={toggleExpand}
      >
        <span className="text-2xl">{pattern.emoji}</span>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-text-primary">{pattern.title}</h3>
          <p className="text-sm text-text-secondary">{pattern.translation}</p>
        </div>
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
            <div className="h-px bg-gray-100 my-4" />

            <div className="space-y-1">
              {pattern.examples.map((example, idx) => (
                <ExampleItem
                  key={example.id}
                  example={example}
                  patternId={pattern.id}
                  index={idx}
                />
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <FavoriteButton patternId={pattern.id} />

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCommentClick}
                className="flex-1 py-3 px-4 rounded-list font-medium flex items-center justify-center gap-2 bg-gray-50 text-text-primary hover:bg-gray-100 transition-all duration-200"
              >
                <MessageCircle size={18} />
                评论{commentCount > 0 ? `+${commentCount}` : ''}
              </motion.button>
            </div>

            <CommentPreview 
              comments={commentPreview} 
              onClick={handleCommentClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
