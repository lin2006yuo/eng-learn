'use client';

import { useState } from 'react';
import { FileText, AlignLeft, BookOpen } from 'lucide-react';
import type { ArticleFormValues, ArticleStatus } from '../types';

interface ArticleEditorFormProps {
  initialValues: ArticleFormValues;
  isSaving?: boolean;
  onSubmit: (values: ArticleFormValues) => Promise<void> | void;
}

const statusOptions: ArticleStatus[] = ['draft', 'published', 'archived'];

const statusMeta: Record<ArticleStatus, { label: string; desc: string }> = {
  draft: { label: '草稿', desc: '仅自己可见' },
  published: { label: '发布', desc: '所有人可浏览' },
  archived: { label: '下线', desc: '已从列表移除' },
};

export function ArticleEditorForm({ initialValues, isSaving = false, onSubmit }: ArticleEditorFormProps) {
  const [values, setValues] = useState<ArticleFormValues>(initialValues);

  const updateField = <T extends keyof ArticleFormValues>(field: T, value: ArticleFormValues[T]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const titleLength = values.title.length;
  const summaryLength = values.summary.length;

  return (
    <div className="article-editor-form bg-white rounded-xl overflow-hidden">
      {/* 标题区域 */}
      <div className="article-editor-title-section px-5 py-4 border-b border-[#E5E5EA]">
        <label className="article-editor-label mb-2 flex items-center gap-2 text-[13px] font-medium text-[#6E6E73]">
          <FileText size={16} className="text-[#007AFF]" />
          标题
        </label>
        <div className="relative">
          <input
            value={values.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="未命名文章"
            maxLength={100}
            className="article-editor-title-input w-full text-[17px] font-semibold text-[#1D1D1F] outline-none placeholder:text-[#C7C7CC] bg-transparent"
          />
          {titleLength > 60 && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[12px] text-[#6E6E73]">
              {titleLength}/100
            </span>
          )}
        </div>
      </div>

      {/* 摘要区域 */}
      <div className="article-editor-summary-section px-5 py-4 border-b border-[#E5E5EA]">
        <label className="article-editor-label mb-2 flex items-center gap-2 text-[13px] font-medium text-[#6E6E73]">
          <AlignLeft size={16} className="text-[#007AFF]" />
          摘要
        </label>
        <div className="relative">
          <textarea
            value={values.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            placeholder="请补充文章摘要"
            rows={3}
            maxLength={200}
            className="article-editor-summary-input w-full resize-none text-[15px] text-[#1D1D1F] leading-relaxed outline-none placeholder:text-[#C7C7CC] bg-transparent"
          />
          {summaryLength > 120 && (
            <span className="absolute bottom-0 right-0 text-[12px] text-[#6E6E73]">
              {summaryLength}/200
            </span>
          )}
        </div>
      </div>

      {/* 正文区域 */}
      <div className="article-editor-content-section px-5 py-4 border-b border-[#E5E5EA]">
        <label className="article-editor-label mb-2 flex items-center gap-2 text-[13px] font-medium text-[#6E6E73]">
          <BookOpen size={16} className="text-[#007AFF]" />
          正文
        </label>
        <textarea
          value={values.content}
          onChange={(e) => updateField('content', e.target.value)}
          placeholder="请补充文章正文"
          rows={16}
          className="article-editor-content-input w-full resize-y text-[15px] leading-8 text-[#1D1D1F] outline-none placeholder:text-[#C7C7CC] bg-transparent"
        />
      </div>

      {/* 状态选择和保存区域 */}
      <div className="article-editor-actions-section px-5 py-5">
        <label className="article-editor-label mb-3 block text-[13px] font-medium text-[#6E6E73]">
          发布状态
        </label>
        <div className="article-editor-status-group mb-3 flex bg-[#F2F2F7] rounded-lg overflow-hidden">
          {statusOptions.map((status) => {
            const meta = statusMeta[status];
            const isActive = values.status === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => updateField('status', status)}
                className={`article-editor-status-option relative flex flex-1 items-center justify-center py-3 text-[14px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#007AFF] text-white'
                    : 'text-[#6E6E73] active:bg-[#E5E5EA]'
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
        <p className="article-editor-status-hint mb-6 text-center text-[13px] text-[#6E6E73]">
          {statusMeta[values.status].desc}
        </p>

        <button
          className="article-editor-save w-full py-3 bg-[#007AFF] text-white text-[17px] font-semibold rounded-lg active:opacity-80 transition-opacity disabled:opacity-50"
          disabled={isSaving}
          onClick={() => onSubmit(values)}
        >
          {isSaving ? '保存中...' : '保存文章'}
        </button>
      </div>
    </div>
  );
}
