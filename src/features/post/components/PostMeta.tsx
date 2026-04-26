import type { PostStatus } from '../types';

interface PostMetaProps {
  authorName: string;
  publishedAt: string | null;
  status: PostStatus;
  viewCount: number;
}

const statusLabelMap: Record<PostStatus, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已下线',
};

function formatDate(value: string | null) {
  if (!value) return '待发布';
  return new Date(value).toLocaleDateString('zh-CN');
}

export function PostMeta({ authorName, publishedAt, status, viewCount }: PostMetaProps) {
  return (
    <div className="post-meta-container flex flex-wrap items-center gap-2 text-[13px] text-[#6E6E73]">
      <span className="post-meta-author">{authorName}</span>
      <span className="text-[#C7C7CC]">·</span>
      <span className="post-meta-date">{formatDate(publishedAt)}</span>
      <span className="text-[#C7C7CC]">·</span>
      <span className="post-meta-views">{viewCount} 浏览</span>
      <span className="text-[#C7C7CC]">·</span>
      <span className="post-meta-status">{statusLabelMap[status]}</span>
    </div>
  );
}
