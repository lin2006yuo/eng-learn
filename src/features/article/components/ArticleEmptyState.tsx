import { FileText } from 'lucide-react';
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
      <div className="article-empty-icon mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F0FE] text-3xl">
        <FileText size={32} className="text-[#1A73E8]" />
      </div>
      <h3 className="article-empty-title mb-2 text-[18px] font-bold text-[#1D1D1F]">{title}</h3>
      <p className="article-empty-description mb-6 text-[14px] text-[#6E6E73]">{description}</p>
      {actionText && onAction ? (
        <Button className="article-empty-btn mx-auto" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </Card>
  );
}
