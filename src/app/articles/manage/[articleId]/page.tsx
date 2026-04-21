'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ArticleEditorForm } from '@/features/article/components/ArticleEditorForm';
import { ArticleEmptyState } from '@/features/article/components/ArticleEmptyState';
import { useArticleMutations, useManageArticleDetail } from '@/features/article/hooks/useArticleMutations';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { useAppStore } from '@/shared/store/appStore';

export const dynamic = 'force-dynamic';

export default function ManageArticleDetailPage() {
  const router = useRouter();
  const { articleId } = useParams<{ articleId: string }>();
  const { user, loading } = useAuth();
  const { data, isLoading, isError, refetch } = useManageArticleDetail(articleId);
  const { updateArticle, deleteArticle } = useArticleMutations();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?from=${encodeURIComponent(`/articles/manage/${articleId}`)}`);
    }
  }, [articleId, loading, router, user]);

  if (loading || !user) {
    return <div className="min-h-screen bg-background px-5 py-10 text-center text-text-secondary">加载中...</div>;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background px-5 py-10">
        <ArticleEmptyState
          title="暂无权限"
          description="只有管理员可以编辑文章。"
          actionText="返回文章管理"
          onAction={() => router.push('/articles/manage')}
        />
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteArticle.mutateAsync(articleId);
    router.push('/articles/manage');
  };

  return (
    <div className="article-manage-edit min-h-screen bg-background">
      <div className="mx-auto max-w-[430px] px-5 pb-10 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="article-manage-edit-header mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/articles/manage')}
              className="article-manage-edit-back flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-primary shadow-card transition-transform active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs text-text-secondary">管理员</p>
              <h1 className="text-xl font-bold text-text-primary">编辑文章</h1>
            </div>
          </div>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={deleteArticle.isPending}
            className="article-manage-edit-delete flex h-10 w-10 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
        </motion.div>

        {isLoading ? <div className="py-20 text-center text-text-secondary">加载编辑内容中...</div> : null}
        {!isLoading && isError ? (
          <ArticleEmptyState title="加载失败" description="文章详情暂时不可用。" actionText="重试" onAction={() => refetch()} />
        ) : null}
        {!isLoading && !isError && data ? (
          <ArticleEditorForm
            initialValues={{
              title: data.title,
              summary: data.summary,
              content: data.content,
              status: data.status,
            }}
            isSaving={updateArticle.isPending}
            onSubmit={async (values) => {
              await updateArticle.mutateAsync({ articleId, values });
              showToast('文章保存成功', 'success');
              router.push('/articles/manage');
            }}
          />
        ) : null}

        <ConfirmModal
          isOpen={confirmDelete}
          title="删除文章"
          message="删除后文章将从公开列表中移除，且无法恢复。"
          confirmText="确认删除"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      </div>
    </div>
  );
}
