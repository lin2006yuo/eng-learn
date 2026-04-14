import { motion } from 'framer-motion';
import { useCopy } from '@/hooks/useCopy';
import type { Pattern } from '@/types';

interface SearchResultProps {
  patterns: Pattern[];
  query: string;
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return text;
  
  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);
  
  return (
    <>
      {before}
      <span className="bg-secondary/20 text-text-primary font-semibold rounded px-0.5">
        {match}
      </span>
      {after}
    </>
  );
}

export function SearchResult({ patterns, query }: SearchResultProps) {
  const { copy, isCopied } = useCopy();

  if (patterns.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-6xl mb-4"
        >
          🔍
        </motion.div>
        <p className="text-text-secondary mb-2">没找到...</p>
        <p className="text-sm text-text-secondary/70">
          试试 "doctor" 或 "医生"
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-6 space-y-4"
    >
      <p className="text-sm text-text-secondary">
        找到 {patterns.length} 个结果
      </p>
      
      {patterns.map((pattern, patternIndex) => (
        <motion.div
          key={pattern.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: patternIndex * 0.1 }}
          className="bg-white rounded-2xl shadow-card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{pattern.emoji}</span>
            <h3 className="font-bold text-text-primary">
              {highlightText(pattern.title, query)}
            </h3>
          </div>
          
          <div className="space-y-2">
            {pattern.examples
              .filter(
                (ex) =>
                  ex.en.toLowerCase().includes(query.toLowerCase()) ||
                  ex.zh.includes(query)
              )
              .map((example) => {
                const copyId = `search-${pattern.id}-${example.id}`;
                const copied = isCopied(copyId);
                
                return (
                  <motion.div
                    key={example.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => copy(example.en, copyId)}
                    className={`
                      p-3 rounded-xl cursor-pointer transition-all
                      ${copied ? 'bg-primary/10' : 'hover:bg-gray-50'}
                    `}
                  >
                    <p className={`
                      font-medium mb-1
                      ${copied ? 'text-primary' : 'text-text-primary'}
                    `}>
                      {highlightText(example.en, query)}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {highlightText(example.zh, query)}
                    </p>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
