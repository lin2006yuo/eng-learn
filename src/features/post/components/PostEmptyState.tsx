import { MessageCircle } from 'lucide-react';
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
      <div className="post-empty-icon mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F0FE] text-3xl">
        <MessageCircle size={32} className="text-[#1A73E8]" />
      </div>
      <h3 className="post-empty-title mb-2 text-[18px] font-bold text-[#1D1D1F]">{title}</h3>
      <p className="post-empty-description mb-6 text-[14px] text-[#6E6E73]">{description}</p>
      {actionText && onAction ? (
        <Button className="post-empty-btn mx-auto" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </Card>
  );
}
