'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
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
    return <div className="min-h-screen bg-[#FAFAFA] px-5 py-10 text-center text-[#6E6E73]">加载中...</div>;
  }

  const handleDelete = async () => {
    await deleteArticle.mutateAsync(articleId);
    router.push('/articles/manage');
  };

  return (
    <div className="article-manage-edit min-h-screen bg-[#FAFAFA]">
      <div className="article-manage-edit-header sticky top-0 z-40 flex items-center justify-between bg-[#FAFAFA]/95 px-5 py-3 backdrop-blur-sm">
        <button
          onClick={() => router.back()}
          className="article-manage-edit-back h-10 w-10 flex items-center justify-center active:opacity-50 transition-opacity"
        >
          <ArrowLeft size={20} className="text-[#007AFF]" />
        </button>
        <h2 className="text-[17px] font-semibold text-[#1D1D1F]">编辑文章</h2>
        <button
          onClick={() => setConfirmDelete(true)}
          disabled={deleteArticle.isPending}
          className="article-manage-edit-delete h-10 w-10 flex items-center justify-center text-[#FF3B30] active:opacity-50 transition-opacity disabled:opacity-50"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mx-auto max-w-[430px]">
        {isLoading ? <div className="py-20 text-center text-[#6E6E73]">加载编辑内容中...</div> : null}
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
              router.back();
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
