import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/shared/components';
import { useModalRouteContext } from '@/shared/hooks/ModalRouteContext';
import type { ArticleSummary } from '../types';

interface ArticleCardProps {
  article: ArticleSummary;
}

function formatPublishTime(value: string | null) {
  if (!value) return '待发布';
  return new Date(value).toLocaleDateString('zh-CN');
}

export function ArticleCard({ article }: ArticleCardProps) {
  const router = useRouter();

  let openModal: ((modalType: 'article', targetId: string) => void) | null = null;
  try {
    const modalContext = useModalRouteContext();
    openModal = modalContext.openModal;
  } catch {
    openModal = null;
  }

  const handleClick = () => {
    if (openModal) {
      openModal('article', article.id);
    } else {
      router.push(`/articles/${article.id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="article-card-btn block w-full text-left"
    >
      <Card className="article-card-container">
        <div className="article-card-badge mb-4 inline-flex rounded-badge bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          学习文章
        </div>
        <h3 className="article-card-title mb-3 text-xl font-bold text-text-primary">{article.title}</h3>
        <p className="article-card-summary mb-4 text-sm leading-6 text-text-secondary">{article.summary}</p>
        <div className="article-card-footer flex items-center justify-between">
          <div className="article-card-meta text-xs text-text-secondary">
            <span>{article.authorName}</span>
            <span className="mx-2">·</span>
            <span>{formatPublishTime(article.publishedAt)}</span>
          </div>
          <div className="article-card-action flex items-center gap-1 text-sm font-semibold text-primary">
            <span>阅读全文</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </Card>
    </button>
  );
}
