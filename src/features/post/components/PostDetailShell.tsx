import { PostDetail } from './PostDetail';
import { PostCommentsSection } from './PostCommentsSection';
import { PostEmptyState } from './PostEmptyState';
import type { PostDetailData } from '../types';

interface PostDetailShellProps {
  post: PostDetailData | undefined;
  postId: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function PostDetailShell({
  post,
  postId,
  isLoading,
  isError,
  onRetry,
}: PostDetailShellProps) {
  if (isLoading) {
    return (
      <div className="post-detail-shell-loading py-20 text-center text-[#6E6E73] text-[15px]">
        加载帖子详情中...
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="post-detail-shell-error px-5">
        <PostEmptyState
          title="帖子不可用"
          description="这个帖子可能已下线或暂时无法访问。"
          actionText="重试"
          onAction={onRetry}
        />
      </div>
    );
  }

  return (
    <div className="post-detail-shell-content">
      <div className="px-5">
        <PostDetail post={post} />
      </div>
      <PostCommentsSection postId={postId} />
    </div>
  );
}
