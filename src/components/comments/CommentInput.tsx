import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { useCommentStore } from '@/stores/commentStore';

interface CommentInputProps {
  patternId: string;
}

/**
 * 评论输入组件
 * 功能：
 * 1. 输入评论内容
 * 2. 字数限制（300字）
 * 3. 发送按钮状态管理
 * 4. 发送成功后清空输入框
 */
export function CommentInput({ patternId }: CommentInputProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { createComment } = useCommentStore();

  const MAX_LENGTH = 300;

  // 当前字数
  const currentLength = content.trim().length;
  // 是否可发送
  const canSubmit = currentLength > 0 && currentLength <= MAX_LENGTH && !isSubmitting;

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 限制最大长度
    if (value.length <= MAX_LENGTH) {
      setContent(value);
    }
  };

  // 处理发送
  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await createComment({
        patternId,
        content: content.trim(),
      });

      // 发送成功，清空输入框
      setContent('');

      // 保持焦点
      inputRef.current?.focus();
    } catch (error) {
      console.error('发送失败:', error);
      alert('发送失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理键盘事件（回车发送）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white border-t border-gray-100 p-4 safe-area-bottom">
      <div className="flex gap-3 items-end">
        {/* 输入框 */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="写下你的评论..."
            maxLength={MAX_LENGTH}
            disabled={isSubmitting}
            className="w-full bg-gray-100 rounded-full px-4 py-3 pr-12 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          {/* 字数提示（接近上限时显示） */}
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

        {/* 发送按钮 */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`
            flex items-center justify-center
            w-11 h-11 rounded-full
            transition-all duration-200
            ${
              canSubmit
                ? 'bg-primary text-white hover:bg-primary-dark active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={18} className={content.trim() ? 'translate-x-0.5' : ''} />
          )}
        </button>
      </div>

    </div>
  );
}
