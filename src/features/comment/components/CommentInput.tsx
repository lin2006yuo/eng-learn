'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useCommentStore } from '@/features/comment/store/commentStore';
import type { CreateCommentAnchorRequest, RootType } from '@/features/comment/types';
import { cn } from '@/shared/utils/cn';

interface CommentInputProps {
  rootId: string;
  rootType: RootType;
  replyToCommentId?: string;
  replyToUserId?: string;
  anchor?: CreateCommentAnchorRequest;
  onReplySuccess?: () => void;
  autoFocus?: boolean;
  variant?: 'page' | 'floating';
  hideAnchorSummary?: boolean;
}

const placeholderMap: Record<RootType, string> = {
  pattern: '写下你的评论...',
  article: '写下你的阅读感受...',
  post: '写下你的评论...',
  note: '写下你的想法...',
};

export function CommentInput(props: CommentInputProps) {
  const {
    rootId,
    rootType,
    replyToCommentId,
    replyToUserId,
    anchor,
    onReplySuccess,
    autoFocus = false,
    variant = 'page',
    hideAnchorSummary = false,
  } = props;
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

  const placeholder = replyToCommentId ? '回复这条评论...' : placeholderMap[rootType];

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    const success = await createComment({
      targetType: replyToCommentId ? 'comment' : rootType,
      targetId: replyToCommentId || rootId,
      rootType,
      rootId,
      content: content.trim(),
      replyToUserId: replyToUserId,
      anchor,
    });

    if (success) {
      setContent('');
      inputRef.current?.focus();
      onReplySuccess?.();
    }
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        'comment-input',
        variant === 'page' ? 'safe-area-bottom' : '',
      )}
    >
      {anchor && !hideAnchorSummary ? (
        <div className="comment-input-anchor mb-3 text-[13px] text-[#6E6E73]">
          评论片段: "{anchor.selectedText}"
        </div>
      ) : null}
      <div className="comment-input-row flex gap-3 items-center">
        <div className="comment-input-field flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={MAX_LENGTH}
            disabled={isSubmitting}
            className="comment-input-input w-full bg-transparent text-[15px] text-[#1D1D1F] placeholder:text-[#C7C7CC] focus:outline-none disabled:opacity-50"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="comment-input-send-button text-[15px] font-medium text-[#007AFF] disabled:text-[#C7C7CC] active:opacity-50 transition-opacity"
        >
          {isSubmitting ? '...' : '发送'}
        </button>
      </div>

      {currentLength > 200 && (
        <div className="comment-input-counter mt-1 text-right text-[12px] text-[#C7C7CC]">
          {currentLength}/{MAX_LENGTH}
        </div>
      )}
    </div>
  );
}
