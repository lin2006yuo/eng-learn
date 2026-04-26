'use client';

import { useParams, useRouter } from 'next/navigation';
import { PostDetailHeader } from '@/features/post/components/PostDetailHeader';
import { PostDetailShell } from '@/features/post/components/PostDetailShell';
import { usePostDetail } from '@/features/post/hooks/usePostDetail';

export const dynamic = 'force-dynamic';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams<{ postId: string }>();
  const postId = params.postId;
  const { data, isLoading, isError, refetch } = usePostDetail(postId);

  return (
    <div className="post-detail-page min-h-screen bg-[#FAFAFA]">
      <div className="post-detail-page-header sticky top-0 z-40 bg-[#FAFAFA]/95 px-5 backdrop-blur-sm">
        <PostDetailHeader onBack={() => router.back()} />
      </div>

      <div className="post-detail-page-content pb-10 pt-4">
        <PostDetailShell
          post={data}
          postId={postId}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
        />
      </div>
    </div>
  );
}
