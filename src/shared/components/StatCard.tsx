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
    <Card delay={delay} className={`flex items-center gap-4 ${onClick ? 'cursor-pointer active:opacity-50 transition-opacity' : ''}`} onClick={onClick}>
      {icon && (
        <div className="w-12 h-12 rounded-[12px] bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
          {icon}
        </div>
      )}
      <div>
        <p className="text-2xl font-bold text-[#1D1D1F]">{value}</p>
        <p className="text-sm text-[#6E6E73]">{title}</p>
      </div>
    </Card>
  );
}
