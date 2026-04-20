'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/features/notification/hooks/useNotifications';
import { useUnreadCount } from '@/features/notification';
import { NotificationItem } from '@/features/notification/components/NotificationItem';

export default function MyNotificationsPage() {
  const router = useRouter();
  const { notifications, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications();
  const { refetch: refetchUnread } = useUnreadCount();
  const hasMarkedRead = useRef(false);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
      const threshold = 200;
      if (scrollHeight - scrollTop - clientHeight < threshold && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    if (!hasMarkedRead.current) {
      hasMarkedRead.current = true;
      fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      }).then(() => {
        void refetchUnread();
      });
    }
  }, [refetchUnread]);

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-[430px] mx-auto px-5 py-4 flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-text-primary" />
          </motion.button>
          <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            我的消息
          </h1>
        </div>
      </header>

      <div
        className="max-w-[430px] mx-auto px-5 space-y-3 pb-6 overflow-auto"
        onScroll={handleScroll}
        style={{ maxHeight: 'calc(100vh - 180px)' }}
      >
        {isLoading && <LoadingSkeleton />}

        {!isLoading && notifications.length === 0 && <EmptyState />}

        {!isLoading && notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
          />
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-subtle-card p-4 shadow-card animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-20 h-3 bg-gray-200 rounded" />
            <div className="w-32 h-3 bg-gray-200 rounded" />
          </div>
          <div className="w-full h-4 bg-gray-200 rounded mb-2" />
          <div className="w-2/3 h-4 bg-gray-200 rounded mb-3" />
        </div>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Bell size={36} className="text-gray-300" />
      </div>
      <p className="text-text-secondary text-sm">暂无消息</p>
      <p className="text-text-tertiary text-xs mt-1">收到回复后这里会显示通知</p>
    </div>
  );
}
