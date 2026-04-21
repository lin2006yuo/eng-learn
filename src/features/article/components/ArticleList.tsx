import type { ArticleSummary } from '../types';
import { ArticleCard } from './ArticleCard';

interface ArticleListProps {
  articles: ArticleSummary[];
}

export function ArticleList({ articles }: ArticleListProps) {
  return (
    <div className="article-list-container space-y-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
