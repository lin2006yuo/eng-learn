import { motion, AnimatePresence } from 'framer-motion';
import { SearchBox, HotTags, SearchResult } from '@/components/search';
import { useSearch } from '@/hooks/useSearch';
import { patterns } from '@/data/patterns';

export function DiscoverPage() {
  const { query, results, handleSearch, isSearching } = useSearch(patterns);

  return (
    <div className="min-h-full pb-24 px-5 pt-4">
      {/* 标题 */}
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-text-primary mb-6"
      >
        发现
      </motion.h1>

      {/* 搜索框 */}
      <SearchBox value={query} onChange={handleSearch} />

      {/* 搜索结果或热门标签 */}
      <AnimatePresence mode="wait">
        {isSearching ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SearchResult patterns={results} query={query} />
          </motion.div>
        ) : (
          <motion.div
            key="hot-tags"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HotTags onTagClick={handleSearch} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
