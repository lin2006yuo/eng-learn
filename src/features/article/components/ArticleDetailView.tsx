'use client';

import React from 'react';
import { BookOpen, Clock3, MessageCircle, UserCircle2 } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { ArticleComments } from './ArticleComments';
import type { ArticleDetail } from '../types';

interface ArticleDetailViewProps {
  article: ArticleDetail;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ArticleDetailView({ article }: ArticleDetailViewProps) {
  return (
    <div className="article-detail-container space-y-5">
      <Card className="article-hero-card space-y-5">
        <div className="article-hero-badge inline-flex rounded-badge bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          英语学习 UGC
        </div>
        <div className="article-hero-header space-y-3">
          <h1 className="article-detail-title text-3xl font-bold leading-tight text-text-primary">
            {article.title}
          </h1>
          <p className="article-detail-summary text-base leading-7 text-text-secondary">
            {article.summary}
          </p>
        </div>
        <div className="article-detail-meta flex flex-wrap gap-3 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <UserCircle2 size={16} />
            {article.author.nickname}
          </span>
          <span className="rounded-badge bg-gray-100 px-2.5 py-1">{formatDate(article.createdAt)}</span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen size={16} />
            {article.wordCount} 词
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={16} />
            预计 {article.readingMinutes} 分钟读完
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle size={16} />
            {article.commentCount} 条讨论
          </span>
        </div>
      </Card>

      <Card className="article-content-card">
        <div className="article-content-body whitespace-pre-wrap text-base leading-8 text-text-primary">
          {article.content}
        </div>
      </Card>

      <ArticleComments articleId={article.id} initialCount={article.commentCount} />
    </div>
  );
}
