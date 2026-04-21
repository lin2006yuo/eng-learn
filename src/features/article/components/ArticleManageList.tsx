import { Button, Card } from '@/shared/components';
import type { ArticleSummary } from '../types';
import { ArticleStatusBadge } from './ArticleStatusBadge';

interface ArticleManageListProps {
  articles: ArticleSummary[];
  onEdit: (articleId: string) => void;
  onDelete: (articleId: string) => void;
}

export function ArticleManageList({ articles, onEdit, onDelete }: ArticleManageListProps) {
  return (
    <div className="article-manage-list space-y-4">
      {articles.map((article) => (
        <Card key={article.id} className="article-manage-card">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 text-xl font-bold text-text-primary">{article.title}</h3>
              <p className="text-sm leading-6 text-text-secondary">{article.summary}</p>
            </div>
            <ArticleStatusBadge status={article.status} />
          </div>
          <div className="mb-4 text-xs text-text-secondary">
            最后更新 {new Date(article.updatedAt).toLocaleString('zh-CN')}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => onEdit(article.id)}>
              编辑文章
            </Button>
            <Button variant="ghost" className="flex-1" onClick={() => onDelete(article.id)}>
              删除
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
