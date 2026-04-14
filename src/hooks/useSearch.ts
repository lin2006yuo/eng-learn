import { useState, useMemo, useCallback } from 'react';
import { searchPatterns } from '@/data/patterns';
import type { Pattern } from '@/types';

export function useSearch(patterns: Pattern[]) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    return searchPatterns(query);
  }, [query]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  const hasResults = results.length > 0;
  const isSearching = query.trim().length > 0;

  return {
    query,
    results,
    handleSearch,
    clearSearch,
    hasResults,
    isSearching,
  };
}
