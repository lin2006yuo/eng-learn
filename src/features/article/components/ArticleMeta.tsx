import type { ArticleStatus } from '../types';

interface ArticleMetaProps {
  authorName: string;
  publishedAt: string | null;
  status: ArticleStatus;
}

const statusLabelMap: Record<ArticleStatus, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已下线',
};

function formatDate(value: string | null) {
  if (!value) return '待发布';
  return new Date(value).toLocaleDateString('zh-CN');
}

export function ArticleMeta({ authorName, publishedAt, status }: ArticleMetaProps) {
  return (
    <div className="article-meta-container flex flex-wrap items-center gap-2 text-[13px] text-[#6E6E73]">
      <span className="article-meta-author">{authorName}</span>
      <span className="text-[#C7C7CC]">·</span>
      <span className="article-meta-date">{formatDate(publishedAt)}</span>
      <span className="text-[#C7C7CC]">·</span>
      <span className="article-meta-status">{statusLabelMap[status]}</span>
    </div>
  );
}
