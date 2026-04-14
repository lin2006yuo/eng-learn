import { motion } from 'framer-motion';
import { hotSearchTags } from '@/data/patterns';

interface HotTagsProps {
  onTagClick: (tag: string) => void;
}

export function HotTags({ onTagClick }: HotTagsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="mt-6"
    >
      <p className="text-sm text-text-secondary mb-3">热门搜索</p>
      <div className="flex flex-wrap gap-2">
        {hotSearchTags.map((tag, index) => (
          <motion.button
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTagClick(tag)}
            className="px-4 py-2 bg-white rounded-full text-sm font-medium
                       text-text-primary shadow-sm border border-gray-100
                       hover:border-primary/30 hover:text-primary transition-all"
          >
            {tag}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
