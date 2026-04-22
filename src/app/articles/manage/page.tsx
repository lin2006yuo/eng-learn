'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { ArticleEmptyState } from '@/features/article/components/ArticleEmptyState';
import { ArticleManageList } from '@/features/article/components/ArticleManageList';
import { useArticleMutations } from '@/features/article/hooks/useArticleMutations';
import { useManageArticleList } from '@/features/article/hooks/useManageArticleList';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/components';
import { ConfirmModal } from '@/shared/components/ConfirmModal';

export const dynamic = 'force-dynamic';

export default function ManageArticlesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { data, isLoading, isError, refetch } = useManageArticleList();
  const { createArticle, deleteArticle } = useArticleMutations();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?from=${encodeURIComponent('/articles/manage')}`);
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return <div className="min-h-screen bg-background px-5 py-10 text-center text-text-secondary">加载中...</div>;
  }

  const handleCreate = async () => {
    const result = await createArticle.mutateAsync({});
    router.push(`/articles/manage/${result.id}`);
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    await deleteArticle.mutateAsync(pendingDeleteId);
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
            <p className="text-sm text-text-secondary">管理你的学习内容</p>
            <h1 className="text-3xl font-bold text-text-primary">我的文章</h1>
          </div>
        </div>
        <Button icon={<Plus size={18} />} onClick={handleCreate} disabled={createArticle.isPending}>
          新建文章
        </Button>
      </div>

      {isLoading ? <div className="py-20 text-center text-text-secondary">加载文章列表中...</div> : null}
      {!isLoading && isError ? (
        <ArticleEmptyState title="加载失败" description="文章列表暂时不可用。" actionText="重试" onAction={() => refetch()} />
      ) : null}
      {!isLoading && !isError && data?.data.length === 0 ? (
        <ArticleEmptyState description="当前还没有文章，点击右上角创建第一篇文章。" />
      ) : null}
      {!isLoading && !isError && data && data.data.length > 0 ? (
        <ArticleManageList
          articles={data.data}
          onEdit={(articleId) => router.push(`/articles/manage/${articleId}`)}
          onDelete={setPendingDeleteId}
        />
      ) : null}

      <ConfirmModal
        isOpen={!!pendingDeleteId}
        title="删除文章"
        message="删除后文章与其公开入口将不可恢复，请确认继续。"
        confirmText="确认删除"
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
