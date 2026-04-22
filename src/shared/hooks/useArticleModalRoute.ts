'use client';

import { useState, useEffect, useCallback } from 'react';

interface ArticleModalState {
  isOpen: boolean;
  targetId: string | null;
}

export function useArticleModalRoute() {
  const [modalState, setModalState] = useState<ArticleModalState>({
    isOpen: false,
    targetId: null,
  });

  const openModal = useCallback((targetId: string) => {
    const newUrl = `/articles/${targetId}`;
    window.history.pushState({ modal: 'article', targetId }, '', newUrl);
    setModalState({ isOpen: true, targetId });
  }, []);

  const closeModal = useCallback(() => {
    window.history.back();
    setModalState({ isOpen: false, targetId: null });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (modalState.isOpen) {
        setModalState({ isOpen: false, targetId: null });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [modalState.isOpen]);

  return {
    isModalOpen: modalState.isOpen,
    targetId: modalState.targetId,
    openModal,
    closeModal,
  };
}
