'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useArticleModalRoute } from './useArticleModalRoute';

interface PostModalContextValue {
  isModalOpen: boolean;
  targetId: string | null;
  openModal: (targetId: string) => void;
  closeModal: () => void;
}

const PostModalContext = createContext<PostModalContextValue | null>(null);

export function PostModalProvider({ children }: { children: ReactNode }) {
  const { isModalOpen, targetId, openModal, closeModal } = useArticleModalRoute();

  return (
    <PostModalContext.Provider value={{ isModalOpen, targetId, openModal, closeModal }}>
      {children}
    </PostModalContext.Provider>
  );
}

export function usePostModalContext() {
  const context = useContext(PostModalContext);
  if (!context) {
    throw new Error('usePostModalContext must be used within PostModalProvider');
  }
  return context;
}
