import { motion } from 'framer-motion';
import { PatternCard } from './PatternCard';
import type { Pattern } from '@/types';

interface PatternListProps {
  patterns: Pattern[];
}

export function PatternList({ patterns }: PatternListProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {patterns.map((pattern, index) => (
        <PatternCard key={pattern.id} pattern={pattern} index={index} />
      ))}
    </motion.div>
  );
}
