import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StatsState } from '@/shared/types';

interface StatsStore extends StatsState {
  incrementCopyCount: () => void;
  updateStreak: () => void;
  resetStats: () => void;
}

const STORAGE_KEY = 'eng-learn-stats';

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      copyCount: 0,
      streakDays: 3,
      lastVisitDate: null,
      
      incrementCopyCount: () => {
        set((state) => ({ copyCount: state.copyCount + 1 }));
      },
      
      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastVisitDate } = get();
        
        if (lastVisitDate === today) {
          return;
        }
        
        if (lastVisitDate) {
          const lastDate = new Date(lastVisitDate);
          const currentDate = new Date(today);
          const diffDays = Math.floor(
            (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (diffDays === 1) {
            set((state) => ({ 
              streakDays: state.streakDays + 1,
              lastVisitDate: today 
            }));
          } else if (diffDays > 1) {
            set({ streakDays: 1, lastVisitDate: today });
          }
        } else {
          set({ streakDays: 1, lastVisitDate: today });
        }
      },
      
      resetStats: () => {
        set({ copyCount: 0, streakDays: 0, lastVisitDate: null });
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
