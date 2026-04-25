'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { PostEmptyState } from '@/features/post/components/PostEmptyState';
import { PostManageList } from '@/features/post/components/PostManageList';
import { usePostMutations } from '@/features/post/hooks/usePostMutations';
import { useManagePostListQuery } from '@/features/post/hooks/useManagePostList';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/components';
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
    return <div className="min-h-screen bg-background px-5 py-10 text-center text-text-secondary">加载中...</div>;
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
    <div className="min-h-screen bg-background px-5 pb-10 pt-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-primary shadow-card"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-sm text-text-secondary">管理你的帖子</p>
            <h1 className="text-3xl font-bold text-text-primary">我的帖子</h1>
          </div>
        </div>
        <Button icon={<Plus size={18} />} onClick={handleCreate} disabled={createPost.isPending}>
          新建帖子
        </Button>
      </div>

      {isLoading ? <div className="py-20 text-center text-text-secondary">加载帖子列表中...</div> : null}
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
