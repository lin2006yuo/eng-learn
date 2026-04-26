import type { PostSummary } from '../types';
import { PostStatusBadge } from './PostStatusBadge';

interface PostManageListProps {
  posts: PostSummary[];
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export function PostManageList({ posts, onEdit, onDelete }: PostManageListProps) {
  return (
    <div className="post-manage-list">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className={`post-manage-item py-4 ${index !== posts.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-[18px] font-semibold text-[#1D1D1F] leading-tight mb-2">{post.title}</h3>
              <div className="flex items-center gap-3 text-[13px] text-[#6E6E73]">
                <span>{post.viewCount} 浏览</span>
                <span>最后更新 {new Date(post.updatedAt).toLocaleString('zh-CN')}</span>
              </div>
            </div>
            <PostStatusBadge status={post.status} />
          </div>
          <div className="mt-3 flex items-center gap-4">
            <button
              className="post-manage-edit text-[14px] font-medium text-[#007AFF] active:opacity-50 transition-opacity"
              onClick={() => onEdit(post.id)}
            >
              编辑
            </button>
            <button
              className="post-manage-delete text-[14px] font-medium text-[#6E6E73] active:opacity-50 transition-opacity"
              onClick={() => onDelete(post.id)}
            >
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
