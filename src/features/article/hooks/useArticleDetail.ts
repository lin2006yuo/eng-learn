'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/utils/api';
import type { ArticleDetailResponse } from '../types';

export function useArticleDetail(articleId: string) {
  return useQuery({
    queryKey: ['articles', articleId],
    enabled: !!articleId,
    queryFn: async () => {
      const result = await apiGet<ArticleDetailResponse>(`/api/articles/${articleId}`);
      if (!result.ok || !result.data) {
        throw new Error('加载文章详情失败');
      }
      return result.data.data;
    },
  });
}
