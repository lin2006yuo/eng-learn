'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/utils/api';
import type { PostListResponse } from '../types';

export function usePostList() {
  return useQuery({
    queryKey: ['posts', 'public'],
    queryFn: async () => {
      const result = await apiGet<PostListResponse>('/api/posts');
      if (!result.ok || !result.data) {
        throw new Error('加载帖子列表失败');
      }
      return result.data;
    },
  });
}
