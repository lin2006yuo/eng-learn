'use client';

import { motion } from 'framer-motion';
import { Home, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useUnreadCount } from '@/features/notification/hooks/useUnreadCount';
import { TabBarBadge } from '@/shared/components/TabBarBadge';

interface Tab {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
}

const tabs: Tab[] = [
  { id: 'square', label: '广场', icon: Home, path: '/' },
  { id: 'profile', label: '我的', icon: User, path: '/profile' },
];

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { total: unreadCount } = useUnreadCount();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname === '/square';
    }
    return pathname === path;
  };

  const handleTabClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#D1D1D6]/50 safe-bottom z-50">
      <div className="max-w-[430px] mx-auto flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          const showBadge = tab.id === 'profile' && unreadCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              className="relative flex flex-col items-center gap-0.5 py-2 px-6 min-w-[80px]"
            >
              <Icon
                size={24}
                strokeWidth={active ? 2.5 : 1.5}
                className={`transition-colors ${
                  active ? 'text-[#007AFF]' : 'text-[#8E8E93]'
                }`}
              />
              <span
                className={`text-[10px] transition-colors ${
                  active ? 'text-[#007AFF] font-semibold' : 'text-[#8E8E93] font-medium'
                }`}
              >
                {tab.label}
              </span>
              {showBadge && <TabBarBadge count={unreadCount} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
