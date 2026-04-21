import { Button, Card } from '@/shared/components';

interface ArticleEmptyStateProps {
  title?: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function ArticleEmptyState({
  title = '暂无文章',
  description,
  actionText,
  onAction,
}: ArticleEmptyStateProps) {
  return (
    <Card className="article-empty-container text-center">
      <div className="article-empty-icon mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
        📝
      </div>
      <h3 className="article-empty-title mb-2 text-xl font-bold text-text-primary">{title}</h3>
      <p className="article-empty-description mb-6 text-sm text-text-secondary">{description}</p>
      {actionText && onAction ? (
        <Button className="article-empty-btn mx-auto" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </Card>
  );
}
