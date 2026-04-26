import type { ArticleSummary } from '../types';
import { ArticleCard } from './ArticleCard';

interface ArticleListProps {
  articles: ArticleSummary[];
}

export function ArticleList({ articles }: ArticleListProps) {
  return (
    <div className="article-list-container">
      {articles.map((article, index) => (
        <div
          key={article.id}
          className={`article-list-item ${index !== articles.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}
        >
          <ArticleCard article={article} />
        </div>
      ))}
    </div>
  );
}
