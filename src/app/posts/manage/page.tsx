'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { PostEmptyState } from '@/features/post/components/PostEmptyState';
import { PostManageList } from '@/features/post/components/PostManageList';
import { usePostMutations } from '@/features/post/hooks/usePostMutations';
import { useManagePostListQuery } from '@/features/post/hooks/useManagePostList';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ConfirmModal } from '@/shared/components/ConfirmModal';

export const dynamic = 'force-dynamic';

export default function ManagePostsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { data, isLoading, isError, refetch } = useManagePostListQuery();
  const { createPost, deletePost } = usePostMutations();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?from=${encodeURIComponent('/posts/manage')}`);
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return <div className="min-h-screen bg-[#FAFAFA] px-5 py-10 text-center text-[#6E6E73]">加载中...</div>;
  }

  const handleCreate = async () => {
    const result = await createPost.mutateAsync({});
    router.push(`/posts/manage/${result.id}`);
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    await deletePost.mutateAsync(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="posts-manage-header sticky top-0 z-40 flex items-center justify-between bg-[#FAFAFA]/95 px-5 py-3 backdrop-blur-sm">
        <button
          onClick={() => router.back()}
          className="posts-manage-back h-10 w-10 flex items-center justify-center active:opacity-50 transition-opacity"
        >
          <ArrowLeft size={20} className="text-[#007AFF]" />
        </button>
        <h2 className="text-[17px] font-semibold text-[#1D1D1F]">我的帖子</h2>
        <button
          onClick={handleCreate}
          disabled={createPost.isPending}
          className="posts-manage-create flex items-center gap-1 text-[14px] font-medium text-[#007AFF] active:opacity-50 transition-opacity disabled:opacity-50"
        >
          <Plus size={18} />
          <span>新建</span>
        </button>
      </div>

      <div className="posts-manage-content px-5 pb-10">
        {isLoading ? <div className="py-20 text-center text-[#6E6E73]">加载帖子列表中...</div> : null}
        {!isLoading && isError ? (
          <PostEmptyState title="加载失败" description="帖子列表暂时不可用。" actionText="重试" onAction={() => refetch()} />
        ) : null}
        {!isLoading && !isError && data?.data.length === 0 ? (
          <PostEmptyState description="当前还没有帖子，点击右上角创建第一个帖子。" />
        ) : null}
        {!isLoading && !isError && data && data.data.length > 0 ? (
          <PostManageList
            posts={data.data}
            onEdit={(postId) => router.push(`/posts/manage/${postId}`)}
            onDelete={setPendingDeleteId}
          />
        ) : null}
      </div>

      <ConfirmModal
        isOpen={!!pendingDeleteId}
        title="删除帖子"
        message="删除后帖子将不可恢复，请确认继续。"
        confirmText="确认删除"
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
