import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Trash2 } from 'lucide-react';
import { useSearchHistory } from '@/hooks/useSearchHistory';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
}

export function SearchBox({ value, onChange, onSearch }: SearchBoxProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  // 点击外部关闭历史记录
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  const showHistory = isFocused && history.length > 0 && !value;

  return (
    <div ref={containerRef} className="relative">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative"
      >
        <form onSubmit={handleSubmit}>
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={22} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
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
      </motion.div>

      {/* 历史记录下拉框 */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-float 
                       overflow-hidden z-50 border border-gray-100"
          >
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
            <div className="py-1">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
