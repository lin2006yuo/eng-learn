import { create } from 'zustand';
import type { TabType, ToastState } from '@/types';

interface AppState {
  currentTab: TabType;
  toast: ToastState;
  searchQuery: string;
  setCurrentTab: (tab: TabType) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentTab: 'learn',
  toast: {
    message: '',
    visible: false,
  },
  searchQuery: '',
  
  setCurrentTab: (tab) => set({ currentTab: tab }),
  
  showToast: (message) => {
    set({ toast: { message, visible: true } });
    // 2秒后自动隐藏
    setTimeout(() => {
      set({ toast: { message: '', visible: false } });
    }, 2000);
  },
  
  hideToast: () => set({ toast: { message: '', visible: false } }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
