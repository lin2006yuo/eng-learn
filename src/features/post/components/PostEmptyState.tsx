import { Button, Card } from '@/shared/components';

interface PostEmptyStateProps {
  title?: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function PostEmptyState({
  title = '暂无帖子',
  description,
  actionText,
  onAction,
}: PostEmptyStateProps) {
  return (
    <Card className="post-empty-container text-center">
      <div className="post-empty-icon mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
        💬
      </div>
      <h3 className="post-empty-title mb-2 text-xl font-bold text-text-primary">{title}</h3>
      <p className="post-empty-description mb-6 text-sm text-text-secondary">{description}</p>
      {actionText && onAction ? (
        <Button className="post-empty-btn mx-auto" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </Card>
  );
}
