'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useArticleModalRoute } from './useArticleModalRoute';

interface ArticleModalContextValue {
  isModalOpen: boolean;
  targetId: string | null;
  openModal: (targetId: string) => void;
  closeModal: () => void;
}

const ArticleModalContext = createContext<ArticleModalContextValue | null>(null);

export function ArticleModalProvider({ children }: { children: ReactNode }) {
  const { isModalOpen, targetId, openModal, closeModal } = useArticleModalRoute();

  return (
    <ArticleModalContext.Provider value={{ isModalOpen, targetId, openModal, closeModal }}>
      {children}
    </ArticleModalContext.Provider>
  );
}

export function useArticleModalContext() {
  const context = useContext(ArticleModalContext);
  if (!context) {
    throw new Error('useArticleModalContext must be used within ArticleModalProvider');
  }
  return context;
}
