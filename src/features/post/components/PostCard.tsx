import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { Card } from '@/shared/components';
import type { PostSummary } from '../types';

interface PostCardProps {
  post: PostSummary;
}

function formatPublishTime(value: string | null) {
  if (!value) return '待发布';
  return new Date(value).toLocaleDateString('zh-CN');
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/posts/${post.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="post-card-btn block w-full text-left"
    >
      <Card className="post-card-container">
        <div className="post-card-badge mb-4 inline-flex rounded-badge bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          交流帖子
        </div>
        <h3 className="post-card-title mb-3 text-xl font-bold text-text-primary">{post.title}</h3>
        <div className="post-card-footer flex items-center justify-between">
          <div className="post-card-meta text-xs text-text-secondary">
            <span>{post.authorName}</span>
            <span className="mx-2">·</span>
            <span>{formatPublishTime(post.publishedAt)}</span>
          </div>
          <div className="post-card-stats flex items-center gap-3 text-xs text-text-secondary">
            <span className="post-card-views">{post.viewCount} 浏览</span>
            <MessageSquare size={14} />
          </div>
        </div>
      </Card>
    </button>
  );
}
