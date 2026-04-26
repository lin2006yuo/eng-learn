'use client';

import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { useCommentStore } from '@/features/comment/store/commentStore';
import type { RootType } from '@/features/comment/types';

interface NotificationReplyInputProps {
  rootType: RootType;
  rootId: string;
  targetId: string;
  actorId: string;
  onReplySuccess?: () => void;
}

export function NotificationReplyInput({ rootType, rootId, targetId, actorId, onReplySuccess }: NotificationReplyInputProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { createComment } = useCommentStore();

  const MAX_LENGTH = 300;

  const currentLength = content.trim().length;
  const canSubmit = currentLength > 0 && currentLength <= MAX_LENGTH && !isSubmitting;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTH) {
      setContent(value);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    const success = await createComment({
      targetType: 'comment',
      targetId,
      rootType,
      rootId,
      content: content.trim(),
      replyToUserId: actorId,
    });

    if (success) {
      setContent('');
      onReplySuccess?.();
    }
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="notif-reply-input pt-3 border-t border-[#E5E5EA]">
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="回复..."
            maxLength={MAX_LENGTH}
            disabled={isSubmitting}
            className="notif-reply-input-field w-full bg-transparent text-[15px] text-[#1D1D1F] placeholder:text-[#C7C7CC] focus:outline-none disabled:opacity-50"
          />
          {currentLength > 250 && (
            <span
              className={`absolute right-0 top-1/2 -translate-y-1/2 text-xs ${
                currentLength >= MAX_LENGTH ? 'text-[#FF3B30]' : 'text-[#6E6E73]'
              }`}
            >
              {currentLength}/{MAX_LENGTH}
            </span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`notif-reply-input-submit flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${
            canSubmit
              ? 'bg-[#007AFF] text-white active:opacity-50'
              : 'bg-[#E5E5EA] text-[#C7C7CC] cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={16} className={content.trim() ? 'translate-x-0.5' : ''} />
          )}
        </button>
      </div>
    </div>
  );
}
