import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy } from 'lucide-react';
import { Card } from '@/components/ui';
import { ExampleItem } from './ExampleItem';
import { FavoriteButton } from '@/components/favorite';
import { useCopy } from '@/hooks/useCopy';
import type { Pattern } from '@/types';

interface PatternCardProps {
  pattern: Pattern;
  index: number;
}

export function PatternCard({ pattern, index }: PatternCardProps) {
  const { copy, isCopied } = useCopy();
  const [isExpanded, setIsExpanded] = useState(true);

  // 从 pattern.id 解析序号，如 "pattern-5" -> "5"
  const patternNumber = pattern.id.replace('pattern-', '');

  const handleCopyAll = () => {
    const allText = pattern.examples.map((ex) => `${ex.en}\n${ex.zh}`).join('\n\n');
    copy(allText, `pattern-${pattern.id}`);
  };

  const copied = isCopied(`pattern-${pattern.id}`);

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

            {/* 操作栏：收藏 + 复制 */}
            <div className="flex gap-3 mt-4">
              <FavoriteButton patternId={pattern.id} />
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyAll}
                className={`
                  flex-1 py-3 px-4 rounded-xl font-medium
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  ${
                    copied
                      ? 'bg-primary text-white'
                      : 'bg-gray-50 text-text-primary hover:bg-gray-100'
                  }
                `}
              >
                <Copy size={18} />
                {copied ? '已复制' : '复制本句型'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
