import { ChevronRight } from 'lucide-react';
import { useArticleModalContext } from '@/shared/hooks/ArticleModalContext';
import type { ArticleSummary } from '../types';

interface ArticleCardProps {
  article: ArticleSummary;
}

function formatPublishTime(value: string | null) {
  if (!value) return '待发布';
  return new Date(value).toLocaleDateString('zh-CN');
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { openModal } = useArticleModalContext();

  const handleClick = () => {
    openModal(article.id);
  };

  return (
    <button
      onClick={handleClick}
      className="article-card-btn w-full text-left active:opacity-50 transition-opacity"
    >
      <div className="article-card-container py-4">
        <h3 className="article-card-title text-[18px] font-semibold text-[#1D1D1F] leading-tight tracking-tight">
          {article.title}
        </h3>
        <p className="article-card-summary mt-2 text-[14px] text-[#6E6E73] leading-snug line-clamp-2">
          {article.summary}
        </p>
        <div className="article-card-footer mt-3 flex items-center justify-between">
          <div className="article-card-meta text-[13px] text-[#6E6E73]">
            <span>{article.authorName}</span>
            <span className="mx-1.5 text-[#C7C7CC]">·</span>
            <span>{formatPublishTime(article.publishedAt)}</span>
          </div>
          <div className="article-card-action flex items-center text-[13px] font-medium text-[#007AFF]">
            <span>阅读全文</span>
            <ChevronRight size={16} className="text-[#C7C7CC]" />
          </div>
        </div>
      </div>
    </button>
  );
}
