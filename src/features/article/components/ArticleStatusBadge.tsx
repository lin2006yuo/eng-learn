import { cn } from '@/shared/utils/cn';
import type { ArticleStatus } from '../types';

interface ArticleStatusBadgeProps {
  status: ArticleStatus;
}

const statusConfig: Record<ArticleStatus, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-[#F5F5F7] text-[#6E6E73]' },
  published: { label: '已发布', className: 'bg-[#007AFF]/10 text-[#007AFF]' },
  archived: { label: '已下线', className: 'bg-[#F5F5F7] text-[#6E6E73]' },
};

export function ArticleStatusBadge({ status }: ArticleStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('rounded-full px-3 py-1 text-[12px] font-semibold', config.className)}>
      {config.label}
    </span>
  );
}
