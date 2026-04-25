'use client';

import { useState, useEffect, useCallback } from 'react';

interface PostModalState {
  isOpen: boolean;
  targetId: string | null;
}

export function usePostModalRoute() {
  const [modalState, setModalState] = useState<PostModalState>({
    isOpen: false,
    targetId: null,
  });

  const openModal = useCallback((targetId: string) => {
    const newUrl = `/posts/${targetId}`;
    window.history.pushState({ modal: 'post', targetId }, '', newUrl);
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
