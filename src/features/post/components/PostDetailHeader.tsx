import { ArrowLeft } from 'lucide-react';

interface PostDetailHeaderProps {
  onBack: () => void;
}

export function PostDetailHeader({ onBack }: PostDetailHeaderProps) {
  return (
    <div className="post-detail-header-wrapper flex items-center gap-3 py-3">
      <button
        onClick={onBack}
        className="post-detail-back-btn w-10 h-10 flex items-center justify-center active:opacity-50 transition-opacity"
      >
        <ArrowLeft size={20} className="text-[#007AFF]" />
      </button>
      <h2 className="post-detail-header-title text-[17px] font-semibold text-[#1D1D1F]">
        帖子内容
      </h2>
    </div>
  );
}
