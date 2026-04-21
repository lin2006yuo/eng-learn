'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useModalRoute } from './useModalRoute';
import type { ModalType } from './useModalRoute';

interface ModalRouteContextValue {
  isModalOpen: boolean;
  activeModalType: ModalType | null;
  activeTargetId: string | null;
  openModal: (modalType: ModalType, targetId: string) => void;
  closeModal: () => void;
}

const ModalRouteContext = createContext<ModalRouteContextValue | null>(null);

export function ModalRouteProvider({ children }: { children: ReactNode }) {
  const { isModalOpen, activeModalType, activeTargetId, openModal, closeModal } = useModalRoute();

  return (
    <ModalRouteContext.Provider
      value={{ isModalOpen, activeModalType, activeTargetId, openModal, closeModal }}
    >
      {children}
    </ModalRouteContext.Provider>
  );
}

export function useModalRouteContext() {
  const context = useContext(ModalRouteContext);
  if (!context) {
    throw new Error(
      'useModalRouteContext must be used within ModalRouteProvider'
    );
  }
  return context;
}
