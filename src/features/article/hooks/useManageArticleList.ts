'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/utils/api';
import type { ArticleListResponse, ArticleStatus } from '../types';

export function useManageArticleList(status?: ArticleStatus) {
  return useQuery({
    queryKey: ['articles', 'manage', status || 'all'],
    queryFn: async () => {
      const result = await apiGet<ArticleListResponse>(
        '/api/articles',
        {
          scope: 'manage',
          ...(status ? { status } : {}),
        }
      );
      if (!result.ok || !result.data) {
        throw new Error('加载文章管理列表失败');
      }
      return result.data;
    },
  });
}
