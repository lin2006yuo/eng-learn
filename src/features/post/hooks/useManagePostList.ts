'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/utils/api';
import type { PostListResponse, PostStatus } from '../types';

export function useManagePostListQuery(status?: PostStatus) {
  return useQuery({
    queryKey: ['posts', 'manage', status || 'all'],
    queryFn: async () => {
      const result = await apiGet<PostListResponse>(
        '/api/posts',
        {
          scope: 'manage',
          ...(status ? { status } : {}),
        }
      );
      if (!result.ok || !result.data) {
        throw new Error('加载帖子管理列表失败');
      }
      return result.data;
    },
  });
}
