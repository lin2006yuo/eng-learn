'use client';

import { useState, useEffect, useCallback } from 'react';

export type ModalType = 'comments' | 'article';

interface ModalRouteState {
  isOpen: boolean;
  modalType: ModalType | null;
  targetId: string | null;
}

export function useModalRoute() {
  const [modalState, setModalState] = useState<ModalRouteState>({
    isOpen: false,
    modalType: null,
    targetId: null,
  });

  const openModal = useCallback((modalType: ModalType, targetId: string) => {
    let newUrl: string;
    if (modalType === 'comments') {
      newUrl = `/pattern/${targetId}/comments`;
    } else if (modalType === 'article') {
      newUrl = `/articles/${targetId}`;
    } else {
      newUrl = '/';
    }
    window.history.pushState({ modal: true, modalType, targetId }, '', newUrl);

    setModalState({
      isOpen: true,
      modalType,
      targetId,
    });
  }, []);

  const closeModal = useCallback(() => {
    window.history.back();

    setModalState({
      isOpen: false,
      modalType: null,
      targetId: null,
    });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (modalState.isOpen) {
        setModalState({
          isOpen: false,
          modalType: null,
          targetId: null,
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [modalState.isOpen]);

  return {
    isModalOpen: modalState.isOpen,
    activeModalType: modalState.modalType,
    activeTargetId: modalState.targetId,
    openModal,
    closeModal,
  };
}
