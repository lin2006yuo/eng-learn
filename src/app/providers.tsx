'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { PatternCommentModalProvider } from '@/shared/hooks/PatternCommentModalContext';
import { ArticleModalProvider } from '@/shared/hooks/ArticleModalContext';
import { PostModalProvider } from '@/shared/hooks/PostModalContext';
import { ModalComments } from '@/features/comment/components/ModalComments';
import { ModalArticleDetail } from '@/features/article/components/ModalArticleDetail';
import { ModalPostDetail } from '@/features/post/components/ModalPostDetail';
import { AnchorHighlightProvider } from '@/features/comment/context/AnchorHighlightContext';

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
      <AnchorHighlightProvider>
        <PatternCommentModalProvider>
          <ArticleModalProvider>
            <PostModalProvider>
              {children}
              <ModalComments />
              <ModalArticleDetail />
              <ModalPostDetail />
            </PostModalProvider>
          </ArticleModalProvider>
        </PatternCommentModalProvider>
      </AnchorHighlightProvider>
    </QueryClientProvider>
  );
}
