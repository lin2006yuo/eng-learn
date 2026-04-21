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
    <div className="article-meta-container flex flex-wrap items-center gap-3 text-sm text-text-secondary">
      <span className="article-meta-author">作者 {authorName}</span>
      <span className="article-meta-date">{formatDate(publishedAt)}</span>
      <span className="article-meta-status rounded-badge bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
        {statusLabelMap[status]}
      </span>
    </div>
  );
}
