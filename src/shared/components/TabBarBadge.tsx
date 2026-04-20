import { motion } from 'framer-motion';

interface TabBarBadgeProps {
  count: number;
}

export function TabBarBadge({ count }: TabBarBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center px-1"
    >
      <span className="text-[10px] font-bold text-white leading-none">{displayCount}</span>
    </motion.div>
  );
}
