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
    <div className="mt-3 pt-3 border-t border-gray-100">
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
            className="w-full bg-gray-50 rounded-input px-4 py-2.5 pr-12 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          {currentLength > 250 && (
            <span
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs ${
                currentLength >= MAX_LENGTH ? 'text-red-500' : 'text-text-tertiary'
              }`}
            >
              {currentLength}/{MAX_LENGTH}
            </span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`
            flex items-center justify-center
            w-9 h-9 rounded-full
            transition-all duration-200
            ${
              canSubmit
                ? 'bg-primary text-white hover:bg-primary-dark active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
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
