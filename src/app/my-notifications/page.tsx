'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNotifications } from '@/features/notification/hooks/useNotifications';
import { useUnreadCount } from '@/features/notification';
import { NotificationListItem } from '@/features/notification/components/NotificationListItem';

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
    <div className="mynotifs-page-container min-h-full bg-[#FAFAFA]">
      <header className="mynotifs-page-header sticky top-0 z-10 bg-[#FAFAFA]/95 backdrop-blur-sm">
        <div className="max-w-[430px] mx-auto px-4 h-12 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="mynotifs-page-back p-2 -ml-2 text-[#007AFF] active:opacity-50 transition-opacity"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="mynotifs-page-title text-[17px] font-semibold text-[#1D1D1F]">
            我的消息
          </h1>
        </div>
      </header>

      <div
        className="max-w-[430px] mx-auto overflow-auto"
        onScroll={handleScroll}
        style={{ maxHeight: 'calc(100vh - 48px)' }}
      >
        {isLoading && <LoadingSkeleton />}

        {!isLoading && notifications.length === 0 && <EmptyState />}

        {!isLoading && notifications.length > 0 && (
          <div className="mynotifs-page-list">
            {notifications.map((notification, index) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                isLast={index === notifications.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mynotifs-page-skeleton">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="mynotifs-skeleton-item px-4 py-4 border-b border-[#E5E5EA] animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E5E5EA] flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-16 h-3 bg-[#E5E5EA] rounded" />
                <div className="w-10 h-3 bg-[#E5E5EA] rounded" />
              </div>
              <div className="w-full h-3 bg-[#E5E5EA] rounded mb-2" />
              <div className="w-20 h-3 bg-[#E5E5EA] rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mynotifs-page-empty flex flex-col items-center justify-center py-20">
      <Bell size={48} className="text-[#C7C7CC] mb-4" />
      <p className="text-[15px] text-[#6E6E73]">暂无消息</p>
      <p className="text-[13px] text-[#C7C7CC] mt-1">收到回复后这里会显示通知</p>
    </div>
  );
}
