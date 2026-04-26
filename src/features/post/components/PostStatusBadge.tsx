import type { PostStatus } from '../types';

interface PostStatusBadgeProps {
  status: PostStatus;
}

const statusLabelMap: Record<PostStatus, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已下线',
};

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
  return (
    <span className="post-status-badge text-[13px] text-[#6E6E73]">
      {statusLabelMap[status]}
    </span>
  );
}
