'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CommentInput } from '@/features/comment/components/CommentInput';
import { CommentItem } from '@/features/comment/components/CommentItem';
import { useCommentStore } from '@/features/comment/store/commentStore';

interface ArticleCommentsProps {
  articleId: string;
  initialCount: number;
}

export function ArticleComments({ articleId, initialCount }: ArticleCommentsProps) {
  const { user } = useAuth();
  const { comments, loading, fetchComments, getCommentStats } = useCommentStore();
  const commentKey = `article-${articleId}`;
  const articleComments = comments[commentKey] || [];
  const stats = getCommentStats('article', articleId);
  const totalCount = stats.count || initialCount;
  const shouldShowLoading = loading && articleComments.length === 0;
  const shouldShowEmpty = !loading && articleComments.length === 0;

  useEffect(() => {
    void fetchComments('article', articleId);
  }, [articleId, fetchComments]);

  return (
    <section className="article-comments-section space-y-4">
      <div className="article-comments-header flex items-center gap-2">
        <MessageCircle size={20} className="text-primary" />
        <h2 className="text-lg font-bold text-text-primary">评论区</h2>
        <span className="rounded-badge bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {totalCount} 条讨论
        </span>
      </div>

      {user ? (
        <div className="article-comments-input overflow-hidden rounded-card border border-primary/10 bg-white shadow-card">
          <CommentInput rootId={articleId} rootType="article" />
        </div>
      ) : (
        <div className="article-comments-login rounded-card bg-white p-5 text-sm text-text-secondary shadow-card">
          登录后可以发布评论、回复学友，参与文章讨论。
          <Link href={`/login?from=/articles/${articleId}`} className="ml-2 font-semibold text-primary">
            立即登录
          </Link>
        </div>
      )}

      <div className="article-comments-list rounded-card bg-white px-5 shadow-card">
        {shouldShowLoading ? (
          <div className="article-comments-loading flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          </div>
        ) : null}

        {shouldShowEmpty ? (
          <div className="article-comments-empty py-12 text-center text-text-secondary">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl">
              💬
            </div>
            <p className="font-medium text-text-primary">还没有人来评论</p>
            <p className="mt-1 text-sm">写下你的想法，成为第一位交流者吧。</p>
          </div>
        ) : null}

        {articleComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            targetId={articleId}
            rootType="article"
          />
        ))}
      </div>
    </section>
  );
}
