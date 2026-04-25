'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
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
    return <div className="min-h-screen bg-background px-5 py-10 text-center text-text-secondary">加载中...</div>;
  }

  const handleDelete = async () => {
    await deletePost.mutateAsync(postId);
    router.push('/posts/manage');
  };

  return (
    <div className="post-manage-edit min-h-screen bg-background">
      <div className="mx-auto max-w-[430px] px-5 pb-10 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="post-manage-edit-header mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="post-manage-edit-back flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-primary shadow-card transition-transform active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs text-text-secondary">帖子编辑</p>
              <h1 className="text-xl font-bold text-text-primary">编辑帖子</h1>
            </div>
          </div>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={deletePost.isPending}
            className="post-manage-edit-delete flex h-10 w-10 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
        </motion.div>

        {isLoading ? <div className="py-20 text-center text-text-secondary">加载编辑内容中...</div> : null}
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
