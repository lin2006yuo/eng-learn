'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { CommentInput } from '@/features/comment/components/CommentInput';
import { CommentItem } from '@/features/comment/components/CommentItem';
import { useCommentStore } from '@/features/comment/store/commentStore';
import { filterNormalComments } from '@/features/comment/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';

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
    <div className="post-comments-container mt-8">
      {/* Header */}
      <div className="post-comments-header px-5 pb-3 border-b border-[#E5E5EA] flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-[#1D1D1F]">评论</h2>
        <span className="text-[13px] text-[#6E6E73]">{visibleComments.length} 条</span>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="post-comments-loading py-10 text-center text-[#6E6E73] text-[15px]">
          加载评论中...
        </div>
      ) : null}

      {/* Comments List */}
      {!loading && visibleComments.length > 0 ? (
        <div className="post-comments-list px-5">
          {visibleComments.map((comment, index) => (
            <div
              key={comment.id}
              className={`post-comments-item ${index !== visibleComments.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}
            >
              <CommentItem
                comment={comment}
                targetId={postId}
                rootType="post"
              />
            </div>
          ))}
        </div>
      ) : null}

      {/* Empty State */}
      {!loading && visibleComments.length === 0 ? (
        <div className="post-comments-empty py-10 text-center">
          <p className="text-[15px] text-[#6E6E73]">还没有评论，欢迎留下你的看法</p>
        </div>
      ) : null}

      {/* Input or Login */}
      <div className="post-comments-footer mt-4 pt-4 border-t border-[#E5E5EA] px-5">
        {user ? (
          <CommentInput rootId={postId} rootType="post" />
        ) : (
          <button
            onClick={() => router.push(`/login?from=${encodeURIComponent(`/posts/${postId}`)}`)}
            className="post-comments-login w-full flex items-center justify-center gap-1 text-[14px] font-medium text-[#007AFF] active:opacity-50 transition-opacity"
          >
            <span>登录后即可参与评论</span>
            <ChevronRight size={16} className="text-[#C7C7CC]" />
          </button>
        )}
      </div>
    </div>
  );
}
