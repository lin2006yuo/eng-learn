import { Card } from '@/shared/components';
import { parseArticlePath, ArticleField } from '@/shared/utils/blockId';
import type { ArticleDetailData } from '../types';
import { ArticleMeta } from './ArticleMeta';
import { ArticleSelectableBody } from './ArticleSelectableBody';

interface ArticleDetailProps {
  article: ArticleDetailData;
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  return (
    <div className="article-detail-container space-y-4">
      <Card className="article-detail-header">
        <div className="article-detail-badge mb-4 inline-flex rounded-badge bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          文章分享
        </div>
        <h1 className="article-detail-title mb-3 text-3xl font-bold leading-tight text-text-primary">
          {article.title}
        </h1>
        <p className="article-detail-summary mb-4 text-base leading-7 text-text-secondary">
          {article.summary}
        </p>
        <ArticleMeta
          authorName={article.authorName}
          publishedAt={article.publishedAt}
          status={article.status}
        />
      </Card>

      <Card className="article-detail-body">
        <ArticleSelectableBody
          rootId={article.id}
          dataPath={parseArticlePath(ArticleField.Content)}
          text={article.content}
        />
      </Card>
    </div>
  );
}
