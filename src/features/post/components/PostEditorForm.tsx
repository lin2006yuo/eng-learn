import { useState } from 'react';
import { BookOpen, Send } from 'lucide-react';
import type { PostFormValues, PostStatus } from '../types';

interface PostEditorFormProps {
  initialValues: PostFormValues;
  isSaving?: boolean;
  onSubmit: (values: PostFormValues) => Promise<void> | void;
}

const statusOptions: PostStatus[] = ['draft', 'published', 'archived'];

const statusMeta: Record<PostStatus, { label: string; desc: string }> = {
  draft: { label: '草稿', desc: '仅自己可见' },
  published: { label: '发布', desc: '所有人可浏览' },
  archived: { label: '下线', desc: '已从列表移除' },
};

export function PostEditorForm({ initialValues, isSaving = false, onSubmit }: PostEditorFormProps) {
  const [values, setValues] = useState<PostFormValues>(initialValues);

  const updateField = <T extends keyof PostFormValues>(field: T, value: PostFormValues[T]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const titleLength = values.title.length;

  return (
    <div className="post-editor-form bg-white rounded-xl overflow-hidden">
      {/* 标题区域 */}
      <div className="post-editor-title-section px-5 py-4 border-b border-[#E5E5EA]">
        <label className="post-editor-label mb-2 flex items-center gap-2 text-[13px] font-medium text-[#6E6E73]">
          <Send size={16} className="text-[#007AFF]" />
          标题
        </label>
        <div className="relative">
          <input
            value={values.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="未命名帖子"
            maxLength={100}
            className="post-editor-title-input w-full text-[17px] font-semibold text-[#1D1D1F] outline-none placeholder:text-[#C7C7CC] bg-transparent"
          />
          {titleLength > 60 && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[12px] text-[#6E6E73]">
              {titleLength}/100
            </span>
          )}
        </div>
      </div>

      {/* 正文区域 */}
      <div className="post-editor-content-section px-5 py-4 border-b border-[#E5E5EA]">
        <label className="post-editor-label mb-2 flex items-center gap-2 text-[13px] font-medium text-[#6E6E73]">
          <BookOpen size={16} className="text-[#007AFF]" />
          正文
        </label>
        <textarea
          value={values.content}
          onChange={(e) => updateField('content', e.target.value)}
          placeholder="请补充帖子正文"
          rows={16}
          className="post-editor-content-input w-full resize-y text-[15px] leading-8 text-[#1D1D1F] outline-none placeholder:text-[#C7C7CC] bg-transparent"
        />
      </div>

      {/* 状态选择和保存区域 */}
      <div className="post-editor-actions-section px-5 py-5">
        <label className="post-editor-label mb-3 block text-[13px] font-medium text-[#6E6E73]">
          发布状态
        </label>
        <div className="post-editor-status-group mb-3 flex bg-[#F2F2F7] rounded-lg overflow-hidden">
          {statusOptions.map((status) => {
            const meta = statusMeta[status];
            const isActive = values.status === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => updateField('status', status)}
                className={`post-editor-status-option relative flex flex-1 items-center justify-center py-3 text-[14px] font-medium transition-all ${
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
        <p className="post-editor-status-hint mb-6 text-center text-[13px] text-[#6E6E73]">
          {statusMeta[values.status].desc}
        </p>

        <button
          className="post-editor-save w-full py-3 bg-[#007AFF] text-white text-[17px] font-semibold rounded-lg active:opacity-80 transition-opacity disabled:opacity-50"
          disabled={isSaving}
          onClick={() => onSubmit(values)}
        >
          {isSaving ? '保存中...' : '保存帖子'}
        </button>
      </div>
    </div>
  );
}
