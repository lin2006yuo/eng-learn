import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Trash2, Tag, ChevronDown } from 'lucide-react';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useFavoriteStore } from '@/stores/favoriteStore';
import type { SearchMode } from '@/types/favorite';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  mode?: SearchMode;
  onModeChange?: (mode: SearchMode) => void;
  selectedTagId?: string | null;
  onTagSelect?: (tagId: string) => void;
  onClearFilter?: () => void;
}

export function SearchBox({ 
  value, 
  onChange, 
  onSearch,
  mode = 'text',
  onModeChange,
  selectedTagId,
  onTagSelect,
  onClearFilter
}: SearchBoxProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();
  
  const tags = useFavoriteStore((state) => state.tags);
  const getTagStats = useFavoriteStore((state) => state.getTagStats);
  const tagStats = getTagStats();
  const statsMap = new Map(tagStats.map((s) => [s.tagId, s.count]));

  const selectedTag = tags.find((t) => t.id === selectedTagId);

  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isFocused) {
      updateDropdownPosition();
    }

    const handleResize = () => {
      if (isFocused) {
        updateDropdownPosition();
      }
    };

    const handleScroll = () => {
      if (isFocused) {
        setIsFocused(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isFocused]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);
      if (!isInsideContainer && !isInsideDropdown) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (value.trim()) {
      addToHistory(value);
      onSearch?.(value);
    }
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSelectHistory = (query: string) => {
    onChange(query);
    addToHistory(query);
    setIsFocused(false);
  };

  const handleSwitchToTagMode = () => {
    onModeChange?.('tag');
    onChange('');
  };

  const handleSwitchToTextMode = () => {
    onModeChange?.('text');
    onClearFilter?.();
  };

  const handleTagSelect = (tagId: string) => {
    onTagSelect?.(tagId);
    setIsFocused(false);
  };

  const showDropdown = isFocused;

  // Text 模式内容
  const textModeContent = (
    <div className={mode === 'text' ? 'block' : 'hidden'}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-text-secondary">
          <Clock size={16} />
          <span className="text-sm font-medium">最近搜索</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={clearHistory}
          className="text-xs text-text-secondary hover:text-primary transition-colors
                     flex items-center gap-1 px-2 py-1 rounded-full hover:bg-gray-50"
        >
          <Trash2 size={12} />
          清空
        </motion.button>
      </div>

      {/* 历史记录列表 */}
      {history.length > 0 ? (
        <div className="py-1 max-h-[200px] overflow-y-auto">
          {history.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between px-4 py-3 
                         hover:bg-gray-50 cursor-pointer group"
              onClick={() => handleSelectHistory(item)}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center
                                text-primary group-hover:bg-primary group-hover:text-white
                                transition-colors">
                  <Clock size={14} />
                </div>
                <span className="text-text-primary font-medium">{item}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromHistory(item);
                }}
                className="w-6 h-6 rounded-full flex items-center justify-center
                           text-gray-300 hover:text-gray-500 hover:bg-gray-100
                           transition-all opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-text-secondary text-sm">
          暂无搜索历史
        </div>
      )}

      {/* 切换到标签搜索 */}
      <div className="border-t border-gray-100">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSwitchToTagMode}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Tag size={14} />
          </div>
          <span className="text-text-primary font-medium">按标签筛选句型</span>
          <ChevronDown size={16} className="ml-auto text-gray-400 -rotate-90" />
        </motion.button>
      </div>
    </div>
  );

  // Tag 模式内容
  const tagModeContent = (
    <div className={mode === 'tag' ? 'block' : 'hidden'}>
      {/* 标签搜索模式 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-text-secondary">
          <Tag size={16} />
          <span className="text-sm font-medium">选择标签筛选</span>
        </div>
      </div>

      {tags.length > 0 ? (
        <div className="py-1 max-h-[280px] overflow-y-auto">
          {tags.map((tag, index) => {
            const count = statsMap.get(tag.id) || 0;
            return (
              <motion.button
                key={tag.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleTagSelect(tag.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 
                  hover:bg-gray-50 transition-colors
                  ${selectedTagId === tag.id ? 'bg-primary/5' : ''}
                `}
              >
                <span className="text-xl">{tag.icon}</span>
                <span className="text-text-primary font-medium flex-1 text-left">
                  {tag.name}
                </span>
                <span className="text-sm text-text-secondary">
                  {count}个句型
                </span>
                {selectedTagId === tag.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-text-secondary text-sm">
          暂无标签，请先创建
        </div>
      )}

      {/* 切换到普通搜索 */}
      <div className="border-t border-gray-100">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSwitchToTextMode}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <Search size={14} />
          </div>
          <span className="text-text-primary font-medium">切换普通搜索</span>
          <ChevronDown size={16} className="ml-auto text-gray-400 -rotate-90" />
        </motion.button>
      </div>
    </div>
  );

  const dropdownContent = (
    <AnimatePresence>
      {showDropdown && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bg-white rounded-2xl shadow-float overflow-hidden z-[9999] border border-gray-100"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
        >
          <motion.div layout initial={false}>
            {textModeContent}
            {tagModeContent}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={containerRef} className="relative">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative"
      >
        {mode === 'text' ? (
          <form onSubmit={handleSubmit}>
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={22} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => {
                updateDropdownPosition();
                setIsFocused(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="搜索英文或中文..."
              className="w-full bg-search-bg rounded-full py-4 pl-14 pr-12 text-lg
                         placeholder:text-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-primary/30 transition-all"
            />
            {value && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => {
                  onChange('');
                  inputRef.current?.focus();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 
                           w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center
                           text-white hover:bg-gray-400 transition-colors"
                style={{ marginTop: '-14px' }}
              >
                <X size={16} />
              </motion.button>
            )}
          </form>
        ) : (
          <div className="relative">
            <button
              onClick={() => {
                updateDropdownPosition();
                setIsFocused(true);
              }}
              className={`
                w-full rounded-full py-4 pl-14 pr-12 text-lg text-left
                transition-all flex items-center gap-2
                ${selectedTag 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-search-bg text-text-primary'
                }
              `}
            >
              <div className="absolute left-5 top-1/2 -translate-y-1/2">
                <Tag size={22} className={selectedTag ? 'text-primary' : 'text-gray-400'} />
              </div>
              {selectedTag ? (
                <>
                  <span className="text-2xl">{selectedTag.icon}</span>
                  <span className="font-medium">{selectedTag.name}</span>
                </>
              ) : (
                <span className="text-gray-400">选择标签...</span>
              )}
            </button>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {selectedTag && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearFilter?.();
                  }}
                  className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center
                             text-white hover:bg-gray-400 transition-colors"
                >
                  <X size={16} />
                </motion.button>
              )}
              <ChevronDown size={20} className="text-gray-400" />
            </div>
          </div>
        )}
      </motion.div>

      {createPortal(dropdownContent, document.body)}
    </div>
  );
}
