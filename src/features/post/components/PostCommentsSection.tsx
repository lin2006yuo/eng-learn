'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CommentInput } from '@/features/comment/components/CommentInput';
import { CommentItem } from '@/features/comment/components/CommentItem';
import { useCommentStore } from '@/features/comment/store/commentStore';
import { filterNormalComments } from '@/features/comment/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button, Card } from '@/shared/components';

interface PostCommentsSectionProps {
  postId: string;
}

export function PostCommentsSection({ postId }: PostCommentsSectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { comments, loading, fetchComments } = useCommentStore();
  const storeKey = `post-${postId}`;
  const postComments = comments[storeKey] || [];

  const visibleComments = useMemo(
    () => filterNormalComments(postComments),
    [postComments],
  );

  useEffect(() => {
    fetchComments('post', postId);
  }, [postId, fetchComments]);

  return (
    <Card className="post-comments-container">
      <div className="post-comments-header mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">互动区</p>
          <h2 className="text-2xl font-bold text-text-primary">帖子评论</h2>
        </div>
        <div className="rounded-badge bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {visibleComments.length} 条
        </div>
      </div>

      {loading ? (
        <div className="post-comments-loading py-10 text-center text-text-secondary">加载评论中...</div>
      ) : null}

      {!loading && visibleComments.length > 0 ? (
        <div className="post-comments-list rounded-subtle-card bg-gray-50 px-4 shadow-sm">
          {visibleComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              targetId={postId}
              rootType="post"
            />
          ))}
        </div>
      ) : null}

      {!loading && visibleComments.length === 0 ? (
        <div className="post-comments-empty rounded-subtle-card bg-gray-50 px-6 py-10 text-center">
          <div className="mb-3 text-3xl">💬</div>
          <p className="mb-1 text-lg font-semibold text-text-primary">还没有评论</p>
          <p className="text-sm text-text-secondary">欢迎留下你的看法。</p>
        </div>
      ) : null}

      {user ? (
        <div className="post-comments-input mt-4 overflow-hidden rounded-subtle-card border border-gray-100">
          <CommentInput rootId={postId} rootType="post" />
        </div>
      ) : (
        <div className="post-comments-login mt-4 rounded-subtle-card bg-secondary/10 p-4">
          <p className="mb-3 text-sm text-text-secondary">登录后即可参与帖子评论与回复。</p>
          <Button onClick={() => router.push(`/login?from=${encodeURIComponent(`/posts/${postId}`)}`)}>
            立即登录
          </Button>
        </div>
      )}
    </Card>
  );
}
