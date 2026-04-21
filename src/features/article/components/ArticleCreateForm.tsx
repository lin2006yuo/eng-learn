'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, PenSquare } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { apiPost } from '@/shared/utils/api';
import { useAppStore } from '@/shared/store/appStore';
import type { ArticleDetailResponse, CreateArticleRequest } from '../types';

interface ArticleCreateFormProps {
  authorName: string;
}

const TITLE_MAX_LENGTH = 80;
const CONTENT_MIN_LENGTH = 120;
const CONTENT_MAX_LENGTH = 12000;

export function ArticleCreateForm({ authorName }: ArticleCreateFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const contentLength = content.trim().length;
  const canSubmit = title.trim().length >= 3 && contentLength >= CONTENT_MIN_LENGTH && !submitting;
  const helperText = useMemo(() => {
    if (contentLength >= CONTENT_MIN_LENGTH) {
      return `已满足发布要求，当前 ${contentLength} 字`;
    }
    return `正文至少 ${CONTENT_MIN_LENGTH} 字，当前 ${contentLength} 字`;
  }, [contentLength]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('请完善标题和正文后再发布');
      return;
    }

    setSubmitting(true);
    setError('');
    const payload: CreateArticleRequest = {
      title: title.trim(),
      content: content.trim(),
    };
    const result = await apiPost<ArticleDetailResponse>('/api/articles', payload);

    if (!result.ok || !result.data?.data) {
      setSubmitting(false);
      setError('发布失败，请稍后重试');
      return;
    }

    useAppStore.getState().showToast('文章发布成功，快去看看吧', 'success');
    router.replace(`/articles/${result.data.data.id}`);
    router.refresh();
  };

  return (
    <div className="article-create-form space-y-5">
      <div className="article-create-tips rounded-card bg-white p-5 shadow-card">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <PenSquare size={18} />
          <span className="font-semibold">发布提示</span>
        </div>
        <p className="text-sm leading-6 text-text-secondary">
          {authorName}，写一篇适合英语学习交流的文章吧。建议使用清晰标题、自然英文正文，并分享你的观点、方法或例句。
        </p>
      </div>

      <div className="article-create-fields rounded-card bg-white p-5 shadow-card">
        <label className="article-title-label mb-2 block text-sm font-semibold text-text-primary">
          文章标题
        </label>
        <input
          value={title}
          maxLength={TITLE_MAX_LENGTH}
          onChange={(event) => {
            setTitle(event.target.value);
            setError('');
          }}
          placeholder="例如：How I Practice English Writing Every Day"
          className="article-title-input mb-2 w-full rounded-subtle-card border border-gray-200 px-4 py-3 text-text-primary outline-none transition focus:border-primary"
        />
        <div className="text-right text-xs text-text-secondary">
          {title.trim().length}/{TITLE_MAX_LENGTH}
        </div>
      </div>

      <div className="article-create-editor rounded-card bg-white p-5 shadow-card">
        <label className="article-content-label mb-2 block text-sm font-semibold text-text-primary">
          英语正文
        </label>
        <textarea
          value={content}
          maxLength={CONTENT_MAX_LENGTH}
          onChange={(event) => {
            setContent(event.target.value);
            setError('');
          }}
          placeholder="Write your article in English..."
          className="article-content-input min-h-[360px] w-full rounded-subtle-card border border-gray-200 px-4 py-4 text-base leading-7 text-text-primary outline-none transition focus:border-primary"
        />
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className={contentLength >= CONTENT_MIN_LENGTH ? 'text-primary' : 'text-text-secondary'}>
            {helperText}
          </span>
          <span className="text-text-secondary">{contentLength}/{CONTENT_MAX_LENGTH}</span>
        </div>
      </div>

      <div className="article-create-actions rounded-card bg-white p-5 shadow-card">
        <div className="mb-4 min-h-5 text-sm text-red-500">{error}</div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            className="article-cancel-btn flex-1 border border-gray-200"
            onClick={() => router.push('/articles')}
          >
            返回文章广场
          </Button>
          <Button
            type="button"
            className="article-submit-btn flex-1"
            disabled={!canSubmit}
            onClick={handleSubmit}
            icon={submitting ? <LoaderCircle size={18} className="animate-spin" /> : <PenSquare size={18} />}
          >
            {submitting ? '正在发布...' : '发布文章'}
          </Button>
        </div>
      </div>
    </div>
  );
}
