'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { PostEmptyState } from '@/features/post/components/PostEmptyState';
import { PostList } from '@/features/post/components/PostList';
import { usePostMutations } from '@/features/post/hooks/usePostMutations';
import { usePostList } from '@/features/post/hooks/usePostList';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/components';

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
    <div className="post-page-container min-h-screen bg-background px-5 pb-10 pt-6">
      <div className="post-page-header mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="post-back-btn flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-primary shadow-card"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-sm text-text-secondary">交流学习心得与想法</p>
            <h1 className="text-3xl font-bold text-text-primary">交流帖子</h1>
          </div>
        </div>
        <Button icon={<Plus size={18} />} onClick={handleCreate} disabled={createPost.isPending}>
          发帖
        </Button>
      </div>

      {isLoading ? (
        <div className="post-loading-container py-20 text-center text-text-secondary">加载帖子中...</div>
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
          <div className="post-page-count mb-4 text-sm text-text-secondary">
            已发布帖子 <span className="font-semibold text-text-primary">({data.totalCount})</span>
          </div>
          <PostList posts={data.data} />
        </>
      ) : null}

      <div className="post-page-footer mt-8 flex justify-center">
        <Button variant="ghost" onClick={() => router.push('/')}>返回广场</Button>
      </div>
    </div>
  );
}
