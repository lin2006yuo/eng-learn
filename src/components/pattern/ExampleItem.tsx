import { motion } from 'framer-motion';
import { useCopy } from '@/hooks/useCopy';
import type { Example } from '@/types';

interface ExampleItemProps {
  example: Example;
  patternId: string;
  index: number;
}

export function ExampleItem({ example, patternId, index }: ExampleItemProps) {
  const { copy, isCopied } = useCopy();
  const copyId = `${patternId}-${example.id}`;
  const copied = isCopied(copyId);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => copy(example.en, copyId)}
      className={`
        py-3 px-4 -mx-4 rounded-xl cursor-pointer
        transition-all duration-200
        ${copied ? 'bg-primary/10' : 'hover:bg-gray-50'}
        active:scale-[0.98]
      `}
    >
      <p className={`
        text-base font-semibold mb-1 transition-colors
        ${copied ? 'text-primary' : 'text-text-primary'}
      `}>
        {example.en}
      </p>
      <p className="text-sm text-text-secondary">
        {example.zh}
      </p>
    </motion.div>
  );
}
