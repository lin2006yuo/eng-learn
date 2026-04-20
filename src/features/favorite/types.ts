export interface FavoriteTag {
  id: string;
  name: string;
  icon: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Favorite {
  patternId: string;
  tagIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface FavoriteStatus {
  isFavorited: boolean;
  tagIds: string[];
}

export type SearchMode = 'text' | 'tag';

export interface TagFilterState {
  activeTagId: string | null;
  isFilterMode: boolean;
}

export interface TagStats {
  tagId: string;
  count: number;
}
