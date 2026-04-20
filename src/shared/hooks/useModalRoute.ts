'use client';

import { useState, useEffect, useCallback } from 'react';

interface ModalRouteState {
  isOpen: boolean;
  patternId: string | null;
}

export function useModalRoute() {
  const [modalState, setModalState] = useState<ModalRouteState>({
    isOpen: false,
    patternId: null,
  });

  const openModal = useCallback((patternId: string) => {
    const newUrl = `/pattern/${patternId}/comments`;
    window.history.pushState({ modal: true, patternId }, '', newUrl);

    setModalState({
      isOpen: true,
      patternId,
    });
  }, []);

  const closeModal = useCallback(() => {
    window.history.back();

    setModalState({
      isOpen: false,
      patternId: null,
    });
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (modalState.isOpen) {
        setModalState({
          isOpen: false,
          patternId: null,
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [modalState.isOpen]);

  return {
    isModalOpen: modalState.isOpen,
    activePatternId: modalState.patternId,
    openModal,
    closeModal,
  };
}
