import { motion } from 'framer-motion';
import { LayoutGrid, Trophy } from 'lucide-react';
import { useAppStore } from '@/shared/store/appStore';
import { useUnreadCount } from '@/features/notification/hooks/useUnreadCount';
import { TabBarBadge } from '@/shared/components/TabBarBadge';
import type { TabType } from '@/shared/types';

const tabs: { id: TabType; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'square', label: '广场', icon: LayoutGrid },
  { id: 'profile', label: '我的', icon: Trophy },
];

export function TabBar() {
  const { currentTab, setCurrentTab } = useAppStore();
  const { total: unreadCount } = useUnreadCount();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-50">
      <div className="max-w-[430px] mx-auto flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          const showBadge = tab.id === 'profile' && unreadCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className="relative flex flex-col items-center gap-1 py-2 px-6 min-w-[80px]"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  color: isActive ? '#58CC71' : '#9CA3AF',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? 'text-primary' : 'text-gray-400'}
                />
              </motion.div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-2 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {showBadge && <TabBarBadge count={unreadCount} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
