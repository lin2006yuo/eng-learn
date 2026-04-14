import { motion } from 'framer-motion';
import { Card } from '@/components/ui';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  delay?: number;
}

export function StatCard({ title, value, icon, delay = 0 }: StatCardProps) {
  return (
    <Card delay={delay} className="flex items-center gap-4">
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
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
