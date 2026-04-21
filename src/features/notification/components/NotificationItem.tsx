'use client';

import { useState, useCallback } from 'react';
import { MessageSquare, Reply } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useModalRouteContext } from '@/shared/hooks/ModalRouteContext';
import { NotificationReplyInput } from './NotificationReplyInput';
import type { Notification } from '@/features/notification/hooks/useNotifications';
import type { RootType } from '@/features/comment/types';

interface NotificationItemProps {
  notification: Notification;
}

const notificationConfig = {
  label: '评论',
  icon: MessageSquare,
  color: 'text-primary',
  bgColor: 'bg-primary/10',
} as const;

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const { openModal } = useModalRouteContext();
  const [showReplyInput, setShowReplyInput] = useState(false);

  const config = notificationConfig;
  const Icon = config.icon;

  const handleClick = useCallback(() => {
    if (notification.targetType === 'comment' && notification.rootId) {
      openModal('comments', notification.rootId);
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

  const isCommentReply = notification.targetType === 'comment';
  const rootType: RootType = 'pattern';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-subtle-card p-4 shadow-card"
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-secondary">
            {notification.actorName.charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-text-primary">
              {notification.actorName}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${config.bgColor} ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs text-text-secondary">回复了你</span>
          </div>

          <button
            onClick={handleClick}
            className="flex items-center gap-2 w-full text-left group"
          >
            <Icon size={12} className="text-text-tertiary flex-shrink-0" />
            <span className="text-xs text-text-primary truncate group-hover:text-primary transition-colors">
              {notification.targetContent}
            </span>
          </button>

          <div className="mt-1.5 text-xs text-text-tertiary">
            {formatTime(notification.createdAt)}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleToggleReply}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Reply size={12} />
              <span>{showReplyInput ? '取消回复' : '回复'}</span>
            </button>
          </div>

          {showReplyInput && (
            <NotificationReplyInput
              rootType={rootType}
              rootId={notification.rootId || notification.targetId}
              targetId={notification.targetId}
              actorId={notification.actorId}
              onReplySuccess={handleReplySuccess}
            />
          )}
        </div>
      </div>
    </motion.div>
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
