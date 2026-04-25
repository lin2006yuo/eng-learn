'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '@/shared/utils/api';
import type { PostDetailResponse, PostFormValues } from '../types';

function invalidatePostQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['posts'] }),
    queryClient.invalidateQueries({ queryKey: ['posts', 'manage'] }),
  ]);
}

export function useManagePostDetail(postId: string) {
  return useQuery({
    queryKey: ['posts', 'manage', postId],
    enabled: !!postId,
    queryFn: async () => {
      const result = await apiGet<PostDetailResponse>(`/api/posts/${postId}`, { scope: 'manage' });
      if (!result.ok || !result.data) {
        throw new Error('加载帖子详情失败');
      }
      return result.data.data;
    },
  });
}

export function usePostMutations() {
  const queryClient = useQueryClient();

  const createPost = useMutation({
    mutationFn: async (values?: Partial<PostFormValues>) => {
      const result = await apiPost<{ data: { id: string } }>('/api/posts', values);
      if (!result.ok || !result.data) {
        throw new Error('创建帖子失败');
      }
      return result.data.data;
    },
    onSuccess: () => invalidatePostQueries(queryClient),
  });

  const updatePost = useMutation({
    mutationFn: async ({ postId, values }: { postId: string; values: PostFormValues }) => {
      const result = await apiPut<{ data: { id: string } }>(`/api/posts/${postId}`, values);
      if (!result.ok || !result.data) {
        throw new Error('更新帖子失败');
      }
      return result.data.data;
    },
    onSuccess: (_data, variables) =>
      Promise.all([
        invalidatePostQueries(queryClient),
        queryClient.invalidateQueries({ queryKey: ['posts', variables.postId] }),
        queryClient.invalidateQueries({ queryKey: ['posts', 'manage', variables.postId] }),
      ]),
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const result = await apiDelete(`/api/posts/${postId}`);
      if (!result.ok) {
        throw new Error('删除帖子失败');
      }
    },
    onSuccess: () => invalidatePostQueries(queryClient),
  });

  return {
    createPost,
    updatePost,
    deletePost,
  };
}
