import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'eng-learn-search-history';
const MAX_HISTORY = 5;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载历史记录
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, MAX_HISTORY));
        }
      }
    } catch (e) {
      console.error('加载搜索历史失败:', e);
    }
    setIsLoaded(true);
  }, []);

  // 保存到 localStorage
  const saveHistory = useCallback((newHistory: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('保存搜索历史失败:', e);
    }
  }, []);

  // 添加搜索记录
  const addToHistory = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      // 去重并移到最前面
      const filtered = prev.filter((item) => item !== trimmed);
      const newHistory = [trimmed, ...filtered].slice(0, MAX_HISTORY);
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  // 删除单条记录
  const removeFromHistory = useCallback((query: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item !== query);
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  // 清空全部记录
  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, [saveHistory]);

  return {
    history,
    isLoaded,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
