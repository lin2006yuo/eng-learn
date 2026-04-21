'use client';

import { useState } from 'react';
import { FileText, AlignLeft, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card } from '@/shared/components';
import type { ArticleFormValues, ArticleStatus } from '../types';

interface ArticleEditorFormProps {
  initialValues: ArticleFormValues;
  isSaving?: boolean;
  onSubmit: (values: ArticleFormValues) => Promise<void> | void;
}

const statusOptions: ArticleStatus[] = ['draft', 'published', 'archived'];

const statusMeta: Record<ArticleStatus, { label: string; desc: string; dot: string }> = {
  draft: { label: '草稿', desc: '仅管理员可见', dot: 'bg-gray-400' },
  published: { label: '发布', desc: '所有人可浏览', dot: 'bg-primary' },
  archived: { label: '下线', desc: '已从列表移除', dot: 'bg-secondary' },
};

export function ArticleEditorForm({ initialValues, isSaving = false, onSubmit }: ArticleEditorFormProps) {
  const [values, setValues] = useState<ArticleFormValues>(initialValues);

  const updateField = <T extends keyof ArticleFormValues>(field: T, value: ArticleFormValues[T]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const titleLength = values.title.length;
  const summaryLength = values.summary.length;

  return (
    <div className="article-editor-form space-y-4">
      <Card className="article-editor-title-section">
        <div className="article-editor-field mb-5">
          <label className="article-editor-label mb-2 flex items-center gap-2 text-sm font-semibold text-text-secondary">
            <FileText size={16} />
            标题
          </label>
          <div className="relative">
            <input
              value={values.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="输入文章标题..."
              maxLength={100}
              className="article-editor-title-input w-full rounded-subtle-card border-2 border-transparent bg-search-bg px-4 py-4 text-lg font-bold text-text-primary outline-none transition-colors placeholder:text-gray-400 focus:border-primary/30 focus:bg-white"
            />
            {titleLength > 60 && (
              <span className="absolute bottom-1.5 right-3 text-xs text-text-secondary">
                {titleLength}/100
              </span>
            )}
          </div>
        </div>

        <div className="article-editor-field">
          <label className="article-editor-label mb-2 flex items-center gap-2 text-sm font-semibold text-text-secondary">
            <AlignLeft size={16} />
            摘要
          </label>
          <div className="relative">
            <textarea
              value={values.summary}
              onChange={(e) => updateField('summary', e.target.value)}
              placeholder="简短描述文章内容..."
              rows={3}
              maxLength={200}
              className="article-editor-summary-input w-full resize-none rounded-subtle-card border-2 border-transparent bg-search-bg px-4 py-3 text-text-primary leading-relaxed outline-none transition-colors placeholder:text-gray-400 focus:border-primary/30 focus:bg-white"
            />
            {summaryLength > 120 && (
              <span className="absolute bottom-2 right-3 text-xs text-text-secondary">
                {summaryLength}/200
              </span>
            )}
          </div>
        </div>
      </Card>

      <Card className="article-editor-content-section">
        <label className="article-editor-label mb-2 flex items-center gap-2 text-sm font-semibold text-text-secondary">
          <BookOpen size={16} />
          正文
        </label>
        <textarea
          value={values.content}
          onChange={(e) => updateField('content', e.target.value)}
          placeholder="开始撰写文章正文..."
          rows={16}
          className="article-editor-content-input w-full resize-y rounded-subtle-card border-2 border-transparent bg-search-bg px-4 py-4 text-base leading-8 text-text-primary outline-none transition-colors placeholder:text-gray-400 focus:border-primary/30 focus:bg-white"
        />
      </Card>

      <Card className="article-editor-actions-section">
        <label className="article-editor-label mb-3 block text-sm font-semibold text-text-secondary">
          发布状态
        </label>
        <div className="article-editor-status-group mb-2 flex rounded-subtle-card bg-search-bg p-1">
          {statusOptions.map((status) => {
            const meta = statusMeta[status];
            const isActive = values.status === status;
            return (
              <motion.button
                key={status}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => updateField('status', status)}
                className={`article-editor-status-option relative flex flex-1 items-center justify-center gap-1.5 rounded-[12px] py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'text-text-secondary'
                }`}
              >
                <span className={`inline-block h-2 w-2 rounded-full ${meta.dot}`} />
                {meta.label}
              </motion.button>
            );
          })}
        </div>
        <p className="article-editor-status-hint mb-8 text-center text-xs text-text-secondary">
          {statusMeta[values.status].desc}
        </p>

        <Button className="w-full" size="lg" disabled={isSaving} onClick={() => onSubmit(values)}>
          {isSaving ? '保存中...' : '保存文章'}
        </Button>
      </Card>
    </div>
  );
}
