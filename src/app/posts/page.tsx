'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { PostEmptyState } from '@/features/post/components/PostEmptyState';
import { PostList } from '@/features/post/components/PostList';
import { usePostMutations } from '@/features/post/hooks/usePostMutations';
import { usePostList } from '@/features/post/hooks/usePostList';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const dynamic = 'force-dynamic';

export default function PostsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = usePostList();
  const { createPost } = usePostMutations();

  const handleCreate = async () => {
    if (!user) {
      router.push(`/login?from=${encodeURIComponent('/posts')}`);
      return;
    }
    const result = await createPost.mutateAsync({});
    router.push(`/posts/manage/${result.id}`);
  };

  return (
    <div className="post-page-container min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="post-page-header sticky top-0 z-40 bg-[#FAFAFA]/95 px-5 py-3 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="post-back-btn w-10 h-10 flex items-center justify-center active:opacity-50 transition-opacity"
          >
            <ArrowLeft size={20} className="text-[#007AFF]" />
          </button>
          <h2 className="text-[17px] font-semibold text-[#1D1D1F]">交流帖子</h2>
        </div>
        <button
          onClick={handleCreate}
          disabled={createPost.isPending}
          className="post-create-btn flex items-center gap-1 text-[14px] font-medium text-[#007AFF] active:opacity-50 transition-opacity disabled:opacity-50"
        >
          <Plus size={18} />
          <span>发帖</span>
        </button>
      </div>

      {/* Subtitle */}
      <div className="post-page-subtitle px-5 pb-3 pt-1">
        <p className="text-[14px] text-[#6E6E73]">交流学习心得与想法</p>
      </div>

      {/* Content */}
      <div className="post-page-content px-5 pb-10">
        {isLoading ? (
          <div className="post-loading-container py-20 text-center text-[#6E6E73] text-[15px]">
            加载帖子中...
          </div>
        ) : null}

        {!isLoading && isError ? (
          <PostEmptyState
            title="加载失败"
            description="帖子列表暂时不可用，请稍后重试。"
            actionText="重新加载"
            onAction={() => refetch()}
          />
        ) : null}

        {!isLoading && !isError && data?.data.length === 0 ? (
          <PostEmptyState description="帖子发布后，这里会显示最新内容。" />
        ) : null}

        {!isLoading && !isError && data && data.data.length > 0 ? (
          <>
            <div className="post-page-count mb-3 text-[14px] text-[#6E6E73]">
              已发布帖子 <span className="font-medium text-[#1D1D1F]">({data.totalCount})</span>
            </div>
            <PostList posts={data.data} />
          </>
        ) : null}
      </div>
    </div>
  );
}
