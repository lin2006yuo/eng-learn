export const TAB_ORDER = ['square', 'profile', 'favorites'] as const;
export type TabType = (typeof TAB_ORDER)[number];
