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
      className="cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all"
      onClick={onClick}
    >
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <span className="text-base font-semibold text-text-primary">{title}</span>
        {badgeCount > 0 && <TabBarBadge count={badgeCount} />}
      </div>
    </Card>
  );
}
