export interface CommentSummary {
  totalCount: number;
  topComments: {
    id: string;
    content: string;
    userId: string;
    createdAt: string;
    likes: number;
    nickname: string;
  }[];
}

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
  commentSummary?: CommentSummary;
}

export type TabType = 'square' | 'profile' | 'favorites';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

export interface StatsState {
  copyCount: number;
  streakDays: number;
  lastVisitDate: string | null;
}
