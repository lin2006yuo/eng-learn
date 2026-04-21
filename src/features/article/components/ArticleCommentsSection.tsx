'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CommentInput } from '@/features/comment/components/CommentInput';
import { CommentItem } from '@/features/comment/components/CommentItem';
import { useCommentStore } from '@/features/comment/store/commentStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button, Card } from '@/shared/components';
import type { Comment } from '@/features/comment/types';

interface ArticleCommentsSectionProps {
  articleId: string;
}

function isNonAnchorComment(comment: Comment): boolean {
  return comment.anchor == null;
}

export function ArticleCommentsSection({ articleId }: ArticleCommentsSectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { comments, loading, fetchComments } = useCommentStore();
  const storeKey = `article-${articleId}`;
  const articleComments = comments[storeKey] || [];

  const visibleComments = useMemo(
    () => articleComments.filter(isNonAnchorComment),
    [articleComments],
  );

  useEffect(() => {
    fetchComments('article', articleId);
  }, [articleId, fetchComments]);

  return (
    <Card className="article-comments-container">
      <div className="article-comments-header mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">互动区</p>
          <h2 className="text-2xl font-bold text-text-primary">文章评论</h2>
        </div>
        <div className="rounded-badge bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {visibleComments.length} 条
        </div>
      </div>

      {loading ? (
        <div className="article-comments-loading py-10 text-center text-text-secondary">加载评论中...</div>
      ) : null}

      {!loading && visibleComments.length > 0 ? (
        <div className="article-comments-list rounded-subtle-card bg-gray-50 px-4 shadow-sm">
          {visibleComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              targetId={articleId}
              rootType="article"
            />
          ))}
        </div>
      ) : null}

      {!loading && visibleComments.length === 0 ? (
        <div className="article-comments-empty rounded-subtle-card bg-gray-50 px-6 py-10 text-center">
          <div className="mb-3 text-3xl">💬</div>
          <p className="mb-1 text-lg font-semibold text-text-primary">还没有评论</p>
          <p className="text-sm text-text-secondary">欢迎留下你的阅读感受或学习心得。</p>
        </div>
      ) : null}

      {user ? (
        <div className="article-comments-input mt-4 overflow-hidden rounded-subtle-card border border-gray-100">
          <CommentInput rootId={articleId} rootType="article" />
        </div>
      ) : (
        <div className="article-comments-login mt-4 rounded-subtle-card bg-secondary/10 p-4">
          <p className="mb-3 text-sm text-text-secondary">登录后即可参与文章评论与回复。</p>
          <Button onClick={() => router.push(`/login?from=${encodeURIComponent(`/articles/${articleId}`)}`)}>
            立即登录
          </Button>
        </div>
      )}
    </Card>
  );
}
