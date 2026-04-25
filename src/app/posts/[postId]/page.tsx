'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PostDetail } from '@/features/post/components/PostDetail';
import { PostCommentsSection } from '@/features/post/components/PostCommentsSection';
import { PostEmptyState } from '@/features/post/components/PostEmptyState';
import { usePostDetail } from '@/features/post/hooks/usePostDetail';

export const dynamic = 'force-dynamic';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams<{ postId: string }>();
  const postId = params.postId;
  const { data, isLoading, isError, refetch } = usePostDetail(postId);

  return (
    <div className="post-detail-page min-h-screen bg-background px-5 pb-10 pt-6">
      <div className="post-detail-page-header mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="post-detail-back-btn flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-primary shadow-card"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-sm text-text-secondary">帖子详情</p>
          <h1 className="text-2xl font-bold text-text-primary">帖子内容</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="post-detail-loading py-20 text-center text-text-secondary">加载帖子详情中...</div>
      ) : null}

      {!isLoading && isError ? (
        <PostEmptyState
          title="帖子不可用"
          description="这个帖子可能已下线或暂时无法访问。"
          actionText="重试"
          onAction={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && data ? (
        <div className="space-y-4">
          <PostDetail post={data} />
          <PostCommentsSection postId={postId} />
        </div>
      ) : null}
    </div>
  );
}
