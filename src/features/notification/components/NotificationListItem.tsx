'use client';

import { useState, useCallback } from 'react';
import { MessageSquare, Reply } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePatternCommentModalContext } from '@/shared/hooks/PatternCommentModalContext';
import { NotificationReplyInput } from './NotificationReplyInput';
import type { Notification } from '@/features/notification/hooks/useNotifications';
import type { RootType } from '@/features/comment/types';

interface NotificationListItemProps {
  notification: Notification;
  isLast?: boolean;
}

export function NotificationListItem({ notification, isLast = false }: NotificationListItemProps) {
  const router = useRouter();
  const { openModal } = usePatternCommentModalContext();
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleClick = useCallback(() => {
    if (notification.targetType === 'comment' && notification.rootId) {
      openModal(notification.rootId);
    } else {
      router.push(`/pattern/${notification.targetId}`);
    }
  }, [notification, router, openModal]);

  const handleToggleReply = useCallback(() => {
    setShowReplyInput((prev) => !prev);
  }, []);

  const handleReplySuccess = useCallback(() => {
    setShowReplyInput(false);
  }, []);

  const rootType: RootType = 'pattern';

  return (
    <div className={`notif-item px-4 py-4 ${isLast ? '' : 'border-b border-[#E5E5EA]'}`}>
      <div className="notif-item-header flex items-center gap-2 mb-2">
        <span className="text-[15px] font-medium text-[#1D1D1F]">
          {notification.actorName}
        </span>
        <span className="text-[13px] text-[#6E6E73]">回复了你</span>
      </div>

      <button
        onClick={handleClick}
        className="notif-item-target flex items-center gap-2 w-full text-left group mb-2"
      >
        <MessageSquare size={13} className="text-[#C7C7CC] flex-shrink-0" />
        <span className="text-[13px] text-[#3A3A3C] truncate group-active:opacity-50 transition-opacity">
          {notification.targetContent}
        </span>
      </button>

      <div className="notif-item-time text-[13px] text-[#6E6E73] mb-3">
        {formatTime(notification.createdAt)}
      </div>

      <div className="notif-item-actions flex items-center gap-4">
        <button
          onClick={handleToggleReply}
          className="flex items-center gap-1 text-[13px] text-[#007AFF] active:opacity-50 transition-opacity"
        >
          <Reply size={13} />
          <span>{showReplyInput ? '取消回复' : '回复'}</span>
        </button>
      </div>

      {showReplyInput && (
        <div className="notif-item-reply mt-3">
          <NotificationReplyInput
            rootType={rootType}
            rootId={notification.rootId || notification.targetId}
            targetId={notification.targetId}
            actorId={notification.actorId}
            onReplySuccess={handleReplySuccess}
          />
        </div>
      )}
    </div>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 30) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN');
}
