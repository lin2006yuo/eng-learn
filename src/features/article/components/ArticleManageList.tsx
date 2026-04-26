import type { ArticleSummary } from '../types';

interface ArticleManageListProps {
  articles: ArticleSummary[];
  onEdit: (articleId: string) => void;
  onDelete: (articleId: string) => void;
}

const statusLabelMap: Record<ArticleSummary['status'], string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已下线',
};

export function ArticleManageList({ articles, onEdit, onDelete }: ArticleManageListProps) {
  return (
    <div className="article-manage-list">
      {articles.map((article, index) => (
        <div
          key={article.id}
          className={`article-manage-item py-4 ${index !== articles.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-[18px] font-semibold text-[#1D1D1F] leading-tight">{article.title}</h3>
              <p className="mt-2 text-[14px] text-[#6E6E73] leading-snug line-clamp-2">{article.summary}</p>
            </div>
            <span className="text-[13px] text-[#6E6E73] shrink-0">{statusLabelMap[article.status]}</span>
          </div>
          <div className="mt-3 text-[13px] text-[#6E6E73]">
            最后更新 {new Date(article.updatedAt).toLocaleDateString('zh-CN')}
          </div>
          <div className="mt-3 flex gap-4">
            <button
              onClick={() => onEdit(article.id)}
              className="text-[14px] font-medium text-[#007AFF] active:opacity-50 transition-opacity"
            >
              编辑
            </button>
            <button
              onClick={() => onDelete(article.id)}
              className="text-[14px] font-medium text-[#6E6E73] active:opacity-50 transition-opacity"
            >
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
