import { create } from 'zustand';
import type { TabType, ToastState, ToastType } from '@/shared/types';

interface AppState {
  currentTab: TabType;
  toast: ToastState;
  searchQuery: string;
  setCurrentTab: (tab: TabType) => void;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentTab: 'square',
  toast: {
    message: '',
    type: 'info',
    visible: false,
  },
  searchQuery: '',
  
  setCurrentTab: (tab) => set({ currentTab: tab }),
  
  showToast: (message, type = 'info') => {
    set({ toast: { message, type, visible: true } });
    setTimeout(() => {
      set({ toast: { message: '', type: 'info', visible: false } });
    }, 2000);
  },
  
  hideToast: () => set({ toast: { message: '', type: 'info', visible: false } }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
