import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
  delay?: number;
}

export function Card({
  children,
  className,
  onClick,
  animate = true,
  delay = 0,
}: CardProps) {
  const cardContent = (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-3xl shadow-card p-6',
        onClick && 'cursor-pointer active:scale-[0.98] transition-transform',
        className
      )}
    >
      {children}
    </div>
  );

  if (!animate) {
    return cardContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        delay,
      }}
    >
      {cardContent}
    </motion.div>
  );
}
