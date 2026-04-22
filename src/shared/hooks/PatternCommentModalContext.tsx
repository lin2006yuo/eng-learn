'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useCommentModalRoute } from './useCommentModalRoute';

interface CommentModalContextValue {
  isModalOpen: boolean;
  targetId: string | null;
  openModal: (targetId: string) => void;
  closeModal: () => void;
}

const PatternCommentModalContext = createContext<CommentModalContextValue | null>(null);

export function PatternCommentModalProvider({ children }: { children: ReactNode }) {
  const { isModalOpen, targetId, openModal, closeModal } = useCommentModalRoute();

  return (
    <PatternCommentModalContext.Provider value={{ isModalOpen, targetId, openModal, closeModal }}>
      {children}
    </PatternCommentModalContext.Provider>
  );
}

export function usePatternCommentModalContext() {
  const context = useContext(PatternCommentModalContext);
  if (!context) {
    throw new Error('usePatternCommentModalContext must be used within PatternCommentModalProvider');
  }
  return context;
}
