'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '@/shared/utils/api';
import type { ArticleDetailResponse, ArticleFormValues } from '../types';

function invalidateArticleQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['articles'] }),
    queryClient.invalidateQueries({ queryKey: ['articles', 'manage'] }),
  ]);
}

export function useManageArticleDetail(articleId: string) {
  return useQuery({
    queryKey: ['articles', 'manage', articleId],
    enabled: !!articleId,
    queryFn: async () => {
      const result = await apiGet<ArticleDetailResponse>(`/api/articles/${articleId}`, { scope: 'manage' });
      if (!result.ok || !result.data) {
        throw new Error('加载文章详情失败');
      }
      return result.data.data;
    },
  });
}

export function useArticleMutations() {
  const queryClient = useQueryClient();

  const createArticle = useMutation({
    mutationFn: async (values?: Partial<ArticleFormValues>) => {
      const result = await apiPost<{ data: { id: string } }>('/api/articles', values);
      if (!result.ok || !result.data) {
        throw new Error('创建文章失败');
      }
      return result.data.data;
    },
    onSuccess: () => invalidateArticleQueries(queryClient),
  });

  const updateArticle = useMutation({
    mutationFn: async ({ articleId, values }: { articleId: string; values: ArticleFormValues }) => {
      const result = await apiPut<{ data: { id: string } }>(`/api/articles/${articleId}`, values);
      if (!result.ok || !result.data) {
        throw new Error('更新文章失败');
      }
      return result.data.data;
    },
    onSuccess: (_data, variables) =>
      Promise.all([
        invalidateArticleQueries(queryClient),
        queryClient.invalidateQueries({ queryKey: ['articles', variables.articleId] }),
        queryClient.invalidateQueries({ queryKey: ['articles', 'manage', variables.articleId] }),
      ]),
  });

  const deleteArticle = useMutation({
    mutationFn: async (articleId: string) => {
      const result = await apiDelete(`/api/articles/${articleId}`);
      if (!result.ok) {
        throw new Error('删除文章失败');
      }
    },
    onSuccess: () => invalidateArticleQueries(queryClient),
  });

  return {
    createArticle,
    updateArticle,
    deleteArticle,
  };
}
