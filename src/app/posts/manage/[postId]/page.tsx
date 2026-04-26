'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { PostEditorForm } from '@/features/post/components/PostEditorForm';
import { PostEmptyState } from '@/features/post/components/PostEmptyState';
import { useManagePostDetail, usePostMutations } from '@/features/post/hooks/usePostMutations';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { useAppStore } from '@/shared/store/appStore';

export const dynamic = 'force-dynamic';

export default function ManagePostDetailPage() {
  const router = useRouter();
  const { postId } = useParams<{ postId: string }>();
  const { user, loading } = useAuth();
  const { data, isLoading, isError, refetch } = useManagePostDetail(postId);
  const { updatePost, deletePost } = usePostMutations();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?from=${encodeURIComponent(`/posts/manage/${postId}`)}`);
    }
  }, [postId, loading, router, user]);

  if (loading || !user) {
    return <div className="min-h-screen bg-[#FAFAFA] px-5 py-10 text-center text-[#6E6E73]">加载中...</div>;
  }

  const handleDelete = async () => {
    await deletePost.mutateAsync(postId);
    router.push('/posts/manage');
  };

  return (
    <div className="post-manage-edit min-h-screen bg-[#FAFAFA]">
      <div className="post-manage-edit-header sticky top-0 z-40 flex items-center justify-between bg-[#FAFAFA]/95 px-5 py-3 backdrop-blur-sm">
        <button
          onClick={() => router.back()}
          className="post-manage-edit-back h-10 w-10 flex items-center justify-center active:opacity-50 transition-opacity"
        >
          <ArrowLeft size={20} className="text-[#007AFF]" />
        </button>
        <h2 className="text-[17px] font-semibold text-[#1D1D1F]">编辑帖子</h2>
        <button
          onClick={() => setConfirmDelete(true)}
          disabled={deletePost.isPending}
          className="post-manage-edit-delete h-10 w-10 flex items-center justify-center text-[#FF3B30] active:opacity-50 transition-opacity disabled:opacity-50"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mx-auto max-w-[430px]">
        {isLoading ? <div className="py-20 text-center text-[#6E6E73]">加载编辑内容中...</div> : null}
        {!isLoading && isError ? (
          <PostEmptyState title="加载失败" description="帖子详情暂时不可用。" actionText="重试" onAction={() => refetch()} />
        ) : null}
        {!isLoading && !isError && data ? (
          <PostEditorForm
            initialValues={{
              title: data.title,
              content: data.content,
              status: data.status,
            }}
            isSaving={updatePost.isPending}
            onSubmit={async (values) => {
              await updatePost.mutateAsync({ postId, values });
              showToast('帖子保存成功', 'success');
              router.back();
            }}
          />
        ) : null}

        <ConfirmModal
          isOpen={confirmDelete}
          title="删除帖子"
          message="删除后帖子将不可恢复。"
          confirmText="确认删除"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      </div>
    </div>
  );
}
