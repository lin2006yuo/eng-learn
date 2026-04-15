export interface Example {
  id: string;
  en: string;
  zh: string;
}

export interface Pattern {
  id: string;
  emoji: string;
  title: string;
  translation: string;
  examples: Example[];
}

export type TabType = 'learn' | 'discover' | 'profile' | 'favorites';

export interface ToastState {
  message: string;
  visible: boolean;
}

export interface StatsState {
  copyCount: number;
  streakDays: number;
  lastVisitDate: string | null;
}
