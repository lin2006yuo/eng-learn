import { Button, Card } from '@/shared/components';
import type { PostSummary } from '../types';
import { PostStatusBadge } from './PostStatusBadge';

interface PostManageListProps {
  posts: PostSummary[];
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export function PostManageList({ posts, onEdit, onDelete }: PostManageListProps) {
  return (
    <div className="post-manage-list space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="post-manage-card">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 text-xl font-bold text-text-primary">{post.title}</h3>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span>{post.viewCount} 浏览</span>
                <span>最后更新 {new Date(post.updatedAt).toLocaleString('zh-CN')}</span>
              </div>
            </div>
            <PostStatusBadge status={post.status} />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => onEdit(post.id)}>
              编辑帖子
            </Button>
            <Button variant="ghost" className="flex-1" onClick={() => onDelete(post.id)}>
              删除
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
