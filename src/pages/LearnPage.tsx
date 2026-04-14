import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { PatternCard } from '@/components/pattern';
import { SearchBox } from '@/components/search';
import { QuickNav } from '@/components/navigation';
import { patterns } from '@/data/patterns';
import { useStatsStore } from '@/stores/statsStore';
import { useSearch } from '@/hooks/useSearch';
import { useScrollSpy, scrollToElement } from '@/hooks/useScrollSpy';

export function LearnPage() {
  const { streakDays } = useStatsStore();
  const { query, results, handleSearch } = useSearch(patterns);

  const displayPatterns = query.trim() ? results : patterns;

  // 生成句型元素 ID 列表
  const patternIds = useMemo(
    () => displayPatterns.map((p) => `pattern-${p.id}`),
    [displayPatterns]
  );

  // 监听当前活跃的句型
  const activePatternId = useScrollSpy(patternIds, {
    threshold: 0.3,
    rootMargin: '-120px 0px -40% 0px',
  });

  // 解析当前活跃序号 (1-based)
  const activeIndex = useMemo(() => {
    if (!activePatternId) return 1;
    const match = activePatternId.match(/pattern-(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }, [activePatternId]);

  // 处理导航点击
  const handleNavSelect = useCallback(
    (index: number) => {
      const pattern = displayPatterns[index - 1];
      if (pattern) {
        scrollToElement(`pattern-${pattern.id}`, 140);
      }
    },
    [displayPatterns]
  );

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg">
            句
          </div>
          <span className="text-xl font-bold text-text-primary">句型英语</span>
        </div>
        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm">
          <Flame size={18} className="text-secondary" />
          <span className="text-sm font-bold text-text-primary">{streakDays}天</span>
        </div>
      </motion.header>

      {/* 问候语 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-5 mb-4"
      >
        <h1 className="text-2xl font-bold text-text-primary">
          Hi, 学习者 👋
        </h1>
        <p className="text-text-secondary mt-1">准备好学句型了吗？</p>
      </motion.div>

      {/* 搜索框 - sticky */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="sticky top-0 z-40 px-5 py-3 bg-background/95 backdrop-blur-sm"
      >
        <SearchBox value={query} onChange={handleSearch} />
      </motion.div>

      {/* 快速导航 - 仅在非搜索模式下显示 */}
      {!query.trim() && displayPatterns.length > 5 && (
        <QuickNav
          total={displayPatterns.length}
          activeIndex={activeIndex}
          onSelect={handleNavSelect}
        />
      )}

      {/* 句型列表 */}
      <div className="px-5 space-y-4">
        {displayPatterns.map((pattern, index) => (
          <div key={pattern.id} id={`pattern-${pattern.id}`}>
            <PatternCard pattern={pattern} index={index} />
          </div>
        ))}
      </div>

      {/* 底部插画 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center py-8"
      >
        <span className="text-4xl mb-2">🦉</span>
        <p className="text-sm text-text-secondary">每天进步一点点</p>
      </motion.div>
    </div>
  );
}
