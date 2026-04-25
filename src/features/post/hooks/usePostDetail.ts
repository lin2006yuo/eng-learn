'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/utils/api';
import type { PostDetailResponse } from '../types';

export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: ['posts', postId],
    enabled: !!postId,
    staleTime: 0,
    queryFn: async () => {
      const result = await apiGet<PostDetailResponse>(`/api/posts/${postId}`);
      if (!result.ok || !result.data) {
        throw new Error('加载帖子详情失败');
      }
      return result.data.data;
    },
  });
}
