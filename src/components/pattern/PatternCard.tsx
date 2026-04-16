import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui';
import { ExampleItem } from './ExampleItem';
import { FavoriteButton } from '@/components/favorite';
import { CommentPreview } from '@/components/comments/CommentPreview';
import { useCommentStore } from '@/stores/commentStore';
import type { Pattern } from '@/types';

interface PatternCardProps {
  pattern: Pattern;
  index: number;
}

export function PatternCard({ pattern, index }: PatternCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  // 获取评论统计
  const { getCommentStats } = useCommentStore();
  const { count: commentCount, preview: commentPreview } = getCommentStats(pattern.id);

  // 从 pattern.id 解析序号，如 "pattern-5" -> "5"
  const patternNumber = pattern.id.replace('pattern-', '');

  const handleCommentClick = () => {
    // 导航到评论页，并保存当前位置作为背景
    navigate(`/pattern/${pattern.id}/comments`, {
      state: { backgroundLocation: location }
    });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card delay={index * 0.1} className="mb-4 relative overflow-hidden">
      {/* 左上角序号 - 装饰性设计 */}
      <div className="absolute -top-3 -left-3 w-12 h-12 bg-primary/10 rounded-full flex items-end justify-end pb-2.5 pr-2.5">
        <span className="text-xs font-bold text-primary">{patternNumber}</span>
      </div>

      {/* 标题区域 - 可点击折叠/展开 */}
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
            {/* 分隔线 */}
            <div className="h-px bg-gray-100 my-4" />

            {/* 例句列表 */}
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

            {/* 操作栏：收藏 + 评论 */}
            <div className="flex gap-3 mt-4">
              <FavoriteButton patternId={pattern.id} />

              {/* 评论按钮 */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCommentClick}
                className="flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 bg-gray-50 text-text-primary hover:bg-gray-100 transition-all duration-200"
              >
                <MessageCircle size={18} />
                评论{commentCount > 0 ? `+${commentCount}` : ''}
              </motion.button>
            </div>

            {/* 评论预览 */}
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
