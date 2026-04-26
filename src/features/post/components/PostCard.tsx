import { MessageSquare } from 'lucide-react';
import { usePostModalContext } from '@/shared/hooks/PostModalContext';
import type { PostSummary } from '../types';

interface PostCardProps {
  post: PostSummary;
}

function formatPublishTime(value: string | null) {
  if (!value) return '待发布';
  return new Date(value).toLocaleDateString('zh-CN');
}

export function PostCard({ post }: PostCardProps) {
  const { openModal } = usePostModalContext();

  const handleClick = () => {
    openModal(post.id);
  };

  return (
    <button
      onClick={handleClick}
      className="post-card-btn w-full text-left active:opacity-50 transition-opacity"
    >
      <div className="post-card-container py-4">
        <h3 className="post-card-title text-[18px] font-semibold text-[#1D1D1F] leading-tight tracking-tight">
          {post.title}
        </h3>
        <div className="post-card-footer mt-3 flex items-center justify-between">
          <div className="post-card-meta text-[13px] text-[#6E6E73]">
            <span>{post.authorName}</span>
            <span className="mx-1.5 text-[#C7C7CC]">·</span>
            <span>{formatPublishTime(post.publishedAt)}</span>
          </div>
          <div className="post-card-stats flex items-center gap-1.5 text-[13px] text-[#6E6E73]">
            <span className="post-card-views">{post.viewCount} 浏览</span>
            <MessageSquare size={14} className="text-[#C7C7CC]" />
          </div>
        </div>
      </div>
    </button>
  );
}
