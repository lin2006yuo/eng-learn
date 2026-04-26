import { ArrowLeft } from 'lucide-react';

interface ArticleDetailHeaderProps {
  onBack: () => void;
}

export function ArticleDetailHeader({ onBack }: ArticleDetailHeaderProps) {
  return (
    <div className="article-detail-header-wrapper flex items-center gap-3 py-3">
      <button
        onClick={onBack}
        className="article-detail-back-btn w-10 h-10 flex items-center justify-center active:opacity-50 transition-opacity"
      >
        <ArrowLeft size={20} className="text-[#007AFF]" />
      </button>
      <h2 className="article-detail-header-title text-[17px] font-semibold text-[#1D1D1F]">
        沉浸阅读
      </h2>
    </div>
  );
}
