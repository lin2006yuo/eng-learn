import { motion } from 'framer-motion';
import { Card } from '@/shared/components/Card';
import { TabBarBadge } from '@/shared/components/TabBarBadge';

interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  delay?: number;
  badgeCount?: number;
  onClick: () => void;
}

export function MenuCard({ icon, title, delay = 0, badgeCount = 0, onClick }: MenuCardProps) {
  return (
    <Card
      delay={delay}
      className="cursor-pointer active:opacity-50 transition-opacity"
      onClick={onClick}
    >
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
          {icon}
        </div>
        <span className="text-base font-semibold text-[#1D1D1F]">{title}</span>
        {badgeCount > 0 && <TabBarBadge count={badgeCount} />}
      </div>
    </Card>
  );
}
