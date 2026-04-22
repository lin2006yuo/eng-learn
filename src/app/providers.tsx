'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { PatternCommentModalProvider } from '@/shared/hooks/PatternCommentModalContext';
import { ArticleModalProvider } from '@/shared/hooks/ArticleModalContext';
import { ModalComments } from '@/features/comment/components/ModalComments';
import { ModalArticleDetail } from '@/features/article/components/ModalArticleDetail';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PatternCommentModalProvider>
        <ArticleModalProvider>
          {children}
          <ModalComments />
          <ModalArticleDetail />
        </ArticleModalProvider>
      </PatternCommentModalProvider>
    </QueryClientProvider>
  );
}
