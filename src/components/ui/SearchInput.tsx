import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = '搜索英文或中文...',
}: SearchInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <Search size={20} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-search-bg rounded-full py-4 pl-12 pr-12 text-base
                   placeholder:text-gray-400 focus:outline-none focus:ring-2 
                   focus:ring-primary/30 transition-all"
      />
      {value && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 
                     w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center
                     text-white hover:bg-gray-400 transition-colors"
        >
          <X size={14} />
        </motion.button>
      )}
    </motion.div>
  );
}
