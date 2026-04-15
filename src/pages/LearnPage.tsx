import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { VirtualPatternList, PatternCard, type VirtualPatternListRef } from '@/components/pattern';
import { SearchBox } from '@/components/search';
import { QuickNav } from '@/components/navigation';
import { patterns } from '@/data/patterns';
import { useStatsStore } from '@/stores/statsStore';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useSearch } from '@/hooks/useSearch';
import type { SearchMode } from '@/types/favorite';

// 顶部各区域高度（单位：px）
const LOGO_HEIGHT = 64;
const GREETING_HEIGHT = 80;
const SEARCH_HEIGHT = 80;
const QUICKNAV_HEIGHT = 64;

const COLLAPSIBLE_HEIGHT = LOGO_HEIGHT + GREETING_HEIGHT;
// 最小内容高度：确保即使只有一个 item 也有足够高度维持稳定滚动
const MIN_CONTENT_HEIGHT = 400;

export function LearnPage() {
  const { streakDays } = useStatsStore();
  const { query, results, handleSearch } = useSearch(patterns);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const virtualListRef = useRef<VirtualPatternListRef>(null);
  const isClickingRef = useRef(false);

  // 收藏相关状态
  const filterState = useFavoriteStore((state) => state.filterState);
  const searchMode = useFavoriteStore((state) => state.searchMode);
  const setFilterTag = useFavoriteStore((state) => state.setFilterTag);
  const clearFilter = useFavoriteStore((state) => state.clearFilter);
  const setSearchMode = useFavoriteStore((state) => state.setSearchMode);
  const getPatternsByTagId = useFavoriteStore((state) => state.getPatternsByTagId);
  const tags = useFavoriteStore((state) => state.tags);

  // 根据过滤状态获取显示的句型
  const displayPatterns = useMemo(() => {
    let filtered = patterns;

    // 标签过滤
    if (filterState.isFilterMode && filterState.activeTagId) {
      const patternIds = getPatternsByTagId(filterState.activeTagId);
      filtered = patterns.filter((p) => patternIds.includes(p.id));
    }

    // 文本搜索
    if (query.trim()) {
      return results;
    }

    return filtered;
  }, [query, results, filterState, getPatternsByTagId]);

  const [scrollActiveIndex, setScrollActiveIndex] = useState(1);
  // 使用 ref 存储 scrollY，避免频繁的 React 状态更新导致重渲染
  const scrollYRef = useRef(0);
  const [scrollY, setScrollY] = useState(0);
  // 使用 requestAnimationFrame id 来节流
  const rafIdRef = useRef<number | null>(null);

  const activeIndex = selectedIndex ?? scrollActiveIndex;

  const showQuickNav = useMemo(
    () => !query.trim() && !filterState.isFilterMode && displayPatterns.length > 5,
    [query, filterState.isFilterMode, displayPatterns.length]
  );

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollYRef.current = currentScrollY;

      // 使用 requestAnimationFrame 节流，与浏览器渲染帧同步
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          setScrollY(scrollYRef.current);
          rafIdRef.current = null;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // 计算 collapsible 区域的高度和透明度
  const { collapsibleHeight, collapsibleOpacity } = useMemo(() => {
    const progress = Math.min(1, scrollY / COLLAPSIBLE_HEIGHT);
    return {
      collapsibleHeight: Math.max(0, COLLAPSIBLE_HEIGHT - scrollY),
      collapsibleOpacity: Math.max(0, 1 - progress),
    };
  }, [scrollY]);

  // 计算 fixed 容器的总高度（动态变化，但不影响文档流）
  const fixedContainerHeight = useMemo(() => {
    const quickNavHeight = showQuickNav ? QUICKNAV_HEIGHT : 0;
    return collapsibleHeight + SEARCH_HEIGHT + quickNavHeight;
  }, [collapsibleHeight, showQuickNav]);

  // spacer 高度固定为最大值，不再随滚动变化
  // 这是打破循环依赖的关键：spacerHeight 固定，documentHeight 稳定
  const spacerHeight = useMemo(() => {
    const quickNavHeight = showQuickNav ? QUICKNAV_HEIGHT : 0;
    return COLLAPSIBLE_HEIGHT + SEARCH_HEIGHT + quickNavHeight;
  }, [showQuickNav]);

  const handleActiveIndexChange = useCallback((index: number) => {
    if (!isClickingRef.current) {
      setScrollActiveIndex(index + 1);
    }
  }, []);

  const handleNavSelect = useCallback((index: number) => {
    isClickingRef.current = true;
    setSelectedIndex(index);
    setScrollActiveIndex(index);

    if (virtualListRef.current) {
      virtualListRef.current.scrollToIndex(index - 1);
    }

    setTimeout(() => {
      isClickingRef.current = false;
    }, 500);

    setTimeout(() => {
      setSelectedIndex(null);
    }, 600);
  }, []);

  const handleModeChange = (mode: SearchMode) => {
    setSearchMode(mode);
  };

  const handleTagSelect = (tagId: string) => {
    setFilterTag(tagId);
  };

  const handleClearFilter = () => {
    clearFilter();
  };

  return (
    <div className="min-h-full">
      {/* 顶部固定容器 - 高度动态变化，但不影响文档流 */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 bg-background overflow-hidden"
        style={{ height: fixedContainerHeight }}
      >
        {/* 可折叠区域 (Logo + 问候语) - 高度随滚动变化 */}
        <div
          className="overflow-hidden"
          style={{
            height: collapsibleHeight,
            opacity: collapsibleOpacity,
          }}
        >
          {/* Logo 栏 */}
          <header className="flex items-center justify-between px-5 py-4" style={{ height: LOGO_HEIGHT }}>
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
          </header>

          {/* 问候语 */}
          <div className="px-5 pb-4" style={{ height: GREETING_HEIGHT }}>
            <h1 className="text-2xl font-bold text-text-primary">
              Hi, 学习者 👋
            </h1>
            <p className="text-text-secondary mt-1">准备好学句型了吗？</p>
          </div>
        </div>

        {/* 搜索框 - 始终显示 */}
        <div className="px-5 py-3 bg-background/95 backdrop-blur-sm" style={{ height: SEARCH_HEIGHT }}>
          <SearchBox
            value={query}
            onChange={handleSearch}
            mode={searchMode}
            onModeChange={handleModeChange}
            selectedTagId={filterState.activeTagId}
            onTagSelect={handleTagSelect}
            onClearFilter={handleClearFilter}
          />
        </div>

        {/* QuickNav */}
        {showQuickNav && (
          <QuickNav
            total={displayPatterns.length}
            activeIndex={activeIndex}
            onSelect={handleNavSelect}
          />
        )}
      </div>

      {/* 占位区域 - 高度固定，不再随滚动变化 */}
      <div style={{ height: spacerHeight }} />

      {/* 内容区域 - 设置最小高度保证 */}
      <div style={{ minHeight: MIN_CONTENT_HEIGHT }}>
        {/* 空状态 */}
        {displayPatterns.length === 0 ? (
          <EmptyState
            isFilterMode={filterState.isFilterMode}
            onClearFilter={handleClearFilter}
          />
        ) : !query.trim() && !filterState.isFilterMode ? (
          <VirtualPatternList
            ref={virtualListRef}
            patterns={displayPatterns}
            onActiveIndexChange={handleActiveIndexChange}
          />
        ) : (
          <div className="px-5 space-y-4 py-4">
            {displayPatterns.map((pattern, index) => (
              <PatternCard key={pattern.id} pattern={pattern} index={index} />
            ))}
          </div>
        )}

        {/* 底部 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center py-8"
        >
          <span className="text-2xl mb-2"></span>
          <p className="text-sm text-text-secondary"></p>
        </motion.div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  isFilterMode: boolean;
  onClearFilter: () => void;
}

function EmptyState({ isFilterMode, onClearFilter }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-5">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6"
      >
        <span className="text-5xl">🤷</span>
      </motion.div>

      <h3 className="text-xl font-bold text-text-primary mb-2 text-center">
        {isFilterMode ? '该标签下还没有句型' : '没有找到匹配的句型'}
      </h3>
      <p className="text-text-secondary mb-8 text-center">
        {isFilterMode ? '去收藏一些句型到这个标签吧！' : '试试其他关键词'}
      </p>

      {isFilterMode && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClearFilter}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
        >
          清除过滤
        </motion.button>
      )}
    </div>
  );
}
