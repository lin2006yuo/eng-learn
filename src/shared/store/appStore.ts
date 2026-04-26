import { create } from 'zustand';
import type { ToastState, ToastType } from '@/shared/types';

interface AppState {
  toast: ToastState;
  searchQuery: string;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  toast: {
    message: '',
    type: 'info',
    visible: false,
  },
  searchQuery: '',

  showToast: (message, type = 'info') => {
    set({ toast: { message, type, visible: true } });
    setTimeout(() => {
      set({ toast: { message: '', type: 'info', visible: false } });
    }, 2000);
  },

  hideToast: () => set({ toast: { message: '', type: 'info', visible: false } }),

  setSearchQuery: (query) => set({ searchQuery: query }),
}));
