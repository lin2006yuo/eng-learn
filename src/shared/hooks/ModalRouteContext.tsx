'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useModalRoute } from './useModalRoute';

interface ModalRouteContextValue {
  isModalOpen: boolean;
  activePatternId: string | null;
  openModal: (patternId: string) => void;
  closeModal: () => void;
}

const ModalRouteContext = createContext<ModalRouteContextValue | null>(null);

export function ModalRouteProvider({ children }: { children: ReactNode }) {
  const { isModalOpen, activePatternId, openModal, closeModal } = useModalRoute();

  return (
    <ModalRouteContext.Provider
      value={{ isModalOpen, activePatternId, openModal, closeModal }}
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
