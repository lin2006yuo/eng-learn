'use client';

import React from 'react';
import Link from 'next/link';
import { Clock3, MessageCircle, UserCircle2 } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import type { ArticleListItem } from '../types';

interface ArticleCardProps {
  article: ArticleListItem;
  index: number;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

export function ArticleCard({ article, index }: ArticleCardProps) {
  return (
    <Card
      animate={false}
      delay={index * 0.05}
      className="article-card-container overflow-hidden p-0"
    >
      <Link href={`/articles/${article.id}`} className="article-card-link block p-6">
        <div className="article-card-header mb-4 flex items-start justify-between gap-4">
          <div>
            <span className="article-card-badge mb-3 inline-flex rounded-badge bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              UGC 文章
            </span>
            <h2 className="article-card-title text-xl font-bold text-text-primary">
              {article.title}
            </h2>
            <p className="article-card-summary mt-3 text-sm leading-6 text-text-secondary">
              {article.summary}
            </p>
          </div>
          <div className="article-card-arrow flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="text-lg">→</span>
          </div>
        </div>

        <div className="article-card-footer flex flex-wrap items-center gap-3 text-xs text-text-secondary">
          <span className="article-card-author inline-flex items-center gap-1.5">
            <UserCircle2 size={14} />
            {article.author.nickname}
          </span>
          <span className="article-card-date rounded-badge bg-gray-100 px-2.5 py-1">
            {formatDate(article.createdAt)}
          </span>
          <span className="article-card-reading inline-flex items-center gap-1.5">
            <Clock3 size={14} />
            {article.wordCount} 词 · {article.readingMinutes} 分钟
          </span>
          <span className="article-card-comment inline-flex items-center gap-1.5">
            <MessageCircle size={14} />
            {article.commentCount} 条讨论
          </span>
        </div>
      </Link>
    </Card>
  );
}
