import { ArticleDetail } from './ArticleDetail';
import { ArticleCommentsSection } from './ArticleCommentsSection';
import { ArticleEmptyState } from './ArticleEmptyState';
import type { ArticleDetailData } from '../types';

interface ArticleDetailShellProps {
  article: ArticleDetailData | undefined;
  articleId: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function ArticleDetailShell({
  article,
  articleId,
  isLoading,
  isError,
  onRetry,
}: ArticleDetailShellProps) {
  if (isLoading) {
    return (
      <div className="article-detail-shell-loading py-20 text-center text-[#6E6E73] text-[15px]">
        加载文章详情中...
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="article-detail-shell-error px-5">
        <ArticleEmptyState
          title="文章不可用"
          description="这篇文章可能已下线或暂时无法访问。"
          actionText="重试"
          onAction={onRetry}
        />
      </div>
    );
  }

  return (
    <div className="article-detail-shell-content">
      <div className="px-5">
        <ArticleDetail article={article} />
      </div>
      <ArticleCommentsSection articleId={articleId} />
    </div>
  );
}
