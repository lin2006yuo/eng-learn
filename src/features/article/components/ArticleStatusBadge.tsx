import { cn } from '@/shared/utils/cn';
import type { ArticleStatus } from '../types';

interface ArticleStatusBadgeProps {
  status: ArticleStatus;
}

const statusConfig: Record<ArticleStatus, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-gray-100 text-text-secondary' },
  published: { label: '已发布', className: 'bg-primary/10 text-primary' },
  archived: { label: '已下线', className: 'bg-secondary/10 text-secondary' },
};

export function ArticleStatusBadge({ status }: ArticleStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('rounded-badge px-3 py-1 text-xs font-semibold', config.className)}>
      {config.label}
    </span>
  );
}
