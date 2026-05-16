'use client';

import { useState, useCallback } from 'react';
import { MessageSquare, Reply } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePatternCommentModalContext } from '@/shared/hooks/PatternCommentModalContext';
import { NotificationReplyInput } from './NotificationReplyInput';
import type { Notification } from '@/features/notification/hooks/useNotifications';
import { getRootTypeFromId } from '@/features/comment/getRootTypeFromId';

interface NotificationListItemProps {
  notification: Notification;
  isLast?: boolean;
}

export function NotificationListItem({ notification, isLast = false }: NotificationListItemProps) {
  const router = useRouter();
  const { openModal } = usePatternCommentModalContext();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const rootType = getRootTypeFromId(notification.rootId);

  const handleClick = useCallback(() => {
    if (!notification.rootId) return;
    const routeStrategies: Record<string, (id: string) => void> = {
      pattern: (id: string) => openModal(id),
      article: (id: string) => router.push(`/articles/${id}`),
      post: (id: string) => router.push(`/posts/${id}`),
    };
    routeStrategies[rootType]?.(notification.rootId);
  }, [notification.rootId, rootType, openModal, router]);

  const handleToggleReply = useCallback(() => {
    setShowReplyInput((prev) => !prev);
  }, []);

  const handleReplySuccess = useCallback(() => {
    setShowReplyInput(false);
  }, []);

  return (
    <div className={`notif-item px-4 py-4 ${isLast ? '' : 'border-b border-[#E5E5EA]'}`}>
      <div className="notif-item-header flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-medium text-[#1D1D1F]">
            {notification.actorName}
          </span>
          <span className="text-[13px] text-[#6E6E73]">回复了你</span>
        </div>
        <span className="text-[13px] text-[#6E6E73] flex-shrink-0">
          {formatTime(notification.createdAt)}
        </span>
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

      {notification.myReplyContent && (
        <div className="notif-item-my-reply bg-[#F5F5F7] rounded-[12px] px-3 py-2.5 mb-3">
          <span className="text-[13px] font-medium text-[#1D1D1F]">我的回复：</span>
          <span className="text-[13px] text-[#6E6E73]">{notification.myReplyContent}</span>
        </div>
      )}

      {!notification.myReplyContent && (
        <div className="notif-item-actions flex items-center gap-4 mb-3">
          <button
            onClick={handleToggleReply}
            className="flex items-center gap-1 text-[13px] text-[#007AFF] active:opacity-50 transition-opacity"
          >
            <Reply size={13} />
            <span>{showReplyInput ? '取消回复' : '回复'}</span>
          </button>
        </div>
      )}

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
