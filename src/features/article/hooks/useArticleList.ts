'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/utils/api';
import type { ArticleListResponse } from '../types';

export function useArticleList() {
  return useQuery({
    queryKey: ['articles', 'public'],
    queryFn: async () => {
      const result = await apiGet<ArticleListResponse>('/api/articles');
      if (!result.ok || !result.data) {
        throw new Error('加载文章列表失败');
      }
      return result.data;
    },
  });
}
