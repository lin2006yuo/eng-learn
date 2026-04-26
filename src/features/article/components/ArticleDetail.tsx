import { parseArticlePath, ArticleField } from '@/shared/utils/blockId';
import type { ArticleDetailData } from '../types';
import { ArticleMeta } from './ArticleMeta';
import { ArticleSelectableBody } from './ArticleSelectableBody';

interface ArticleDetailProps {
  article: ArticleDetailData;
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  return (
    <div className="article-detail-container">
      {/* Header Section */}
      <div className="article-detail-header pb-4 border-b border-[#E5E5EA]">
        <h1 className="article-detail-title text-[22px] font-bold leading-tight tracking-tight text-[#1D1D1F]">
          {article.title}
        </h1>
        <p className="article-detail-summary mt-3 text-[16px] leading-snug text-[#3A3A3C]">
          {article.summary}
        </p>
        <div className="article-detail-meta mt-4">
          <ArticleMeta
            authorName={article.authorName}
            publishedAt={article.publishedAt}
            status={article.status}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="article-detail-body py-6">
        <ArticleSelectableBody
          rootId={article.id}
          dataPath={parseArticlePath(ArticleField.Content)}
          text={article.content}
        />
      </div>
    </div>
  );
}
