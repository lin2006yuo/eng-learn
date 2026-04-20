import { motion } from 'framer-motion';
import { Card } from '@/shared/components/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  delay?: number;
  onClick?: () => void;
}

export function StatCard({ title, value, icon, delay = 0, onClick }: StatCardProps) {
  return (
    <Card delay={delay} className={`flex items-center gap-4 ${onClick ? 'cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all' : ''}`} onClick={onClick}>
      {icon && (
        <div className="w-12 h-12 rounded-subtle-card bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      )}
      <div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-sm text-text-secondary">{title}</p>
      </div>
    </Card>
  );
}
