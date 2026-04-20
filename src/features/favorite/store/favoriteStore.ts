import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FavoriteTag, Favorite, TagFilterState, SearchMode } from '../types';

interface FavoriteState {
  tags: FavoriteTag[];
  favorites: Favorite[];
  filterState: TagFilterState;
  searchMode: SearchMode;
}

interface FavoriteActions {
  addTag: (name: string, icon: string) => FavoriteTag;
  updateTag: (id: string, updates: Partial<FavoriteTag>) => void;
  deleteTag: (id: string) => void;
  addFavorite: (patternId: string, tagIds: string[]) => void;
  removeFavorite: (patternId: string) => void;
  updateFavoriteTags: (patternId: string, tagIds: string[]) => void;
  getFavoriteByPatternId: (patternId: string) => Favorite | undefined;
  getPatternsByTagId: (tagId: string) => string[];
  getTagStats: () => { tagId: string; count: number }[];
  setFilterTag: (tagId: string | null) => void;
  clearFilter: () => void;
  setSearchMode: (mode: SearchMode) => void;
  isPatternFavorited: (patternId: string) => boolean;
  getPatternTagIds: (patternId: string) => string[];
}

const generateId = () => `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const DEFAULT_TAGS: FavoriteTag[] = [
  {
    id: 'default-love',
    name: '爱心',
    icon: '❤️',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const initialState: FavoriteState = {
  tags: DEFAULT_TAGS,
  favorites: [],
  filterState: {
    activeTagId: null,
    isFilterMode: false,
  },
  searchMode: 'text',
};

export const useFavoriteStore = create<FavoriteState & FavoriteActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addTag: (name: string, icon: string) => {
        const newTag: FavoriteTag = {
          id: generateId(),
          name,
          icon,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          tags: [...state.tags, newTag],
        }));
        return newTag;
      },

      updateTag: (id: string, updates: Partial<FavoriteTag>) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === id ? { ...tag, ...updates, updatedAt: Date.now() } : tag
          ),
        }));
      },

      deleteTag: (id: string) => {
        set((state) => ({
          tags: state.tags.filter((tag) => tag.id !== id),
          favorites: state.favorites.map((fav) => ({
            ...fav,
            tagIds: fav.tagIds.filter((tagId) => tagId !== id),
          })).filter((fav) => fav.tagIds.length > 0),
        }));
      },

      addFavorite: (patternId: string, tagIds: string[]) => {
        const now = Date.now();
        set((state) => {
          const existingIndex = state.favorites.findIndex((f) => f.patternId === patternId);
          if (existingIndex >= 0) {
            const newFavorites = [...state.favorites];
            newFavorites[existingIndex] = {
              ...newFavorites[existingIndex],
              tagIds: [...new Set([...newFavorites[existingIndex].tagIds, ...tagIds])],
              updatedAt: now,
            };
            return { favorites: newFavorites };
          }
          return {
            favorites: [
              ...state.favorites,
              {
                patternId,
                tagIds,
                createdAt: now,
                updatedAt: now,
              },
            ],
          };
        });
      },

      removeFavorite: (patternId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.patternId !== patternId),
        }));
      },

      updateFavoriteTags: (patternId: string, tagIds: string[]) => {
        const now = Date.now();
        set((state) => {
          const existingIndex = state.favorites.findIndex((f) => f.patternId === patternId);
          if (existingIndex >= 0) {
            if (tagIds.length === 0) {
              return {
                favorites: state.favorites.filter((f) => f.patternId !== patternId),
              };
            }
            const newFavorites = [...state.favorites];
            newFavorites[existingIndex] = {
              ...newFavorites[existingIndex],
              tagIds,
              updatedAt: now,
            };
            return { favorites: newFavorites };
          }
          return {
            favorites: [
              ...state.favorites,
              {
                patternId,
                tagIds,
                createdAt: now,
                updatedAt: now,
              },
            ],
          };
        });
      },

      getFavoriteByPatternId: (patternId: string) => {
        return get().favorites.find((f) => f.patternId === patternId);
      },

      getPatternsByTagId: (tagId: string) => {
        return get().favorites
          .filter((f) => f.tagIds.includes(tagId))
          .map((f) => f.patternId);
      },

      getTagStats: () => {
        const { tags, favorites } = get();
        return tags.map((tag) => ({
          tagId: tag.id,
          count: favorites.filter((f) => f.tagIds.includes(tag.id)).length,
        }));
      },

      setFilterTag: (tagId: string | null) => {
        set({
          filterState: {
            activeTagId: tagId,
            isFilterMode: tagId !== null,
          },
        });
      },

      clearFilter: () => {
        set({
          filterState: {
            activeTagId: null,
            isFilterMode: false,
          },
          searchMode: 'text',
        });
      },

      setSearchMode: (mode: SearchMode) => {
        set({ searchMode: mode });
      },

      isPatternFavorited: (patternId: string) => {
        return get().favorites.some((f) => f.patternId === patternId);
      },

      getPatternTagIds: (patternId: string) => {
        const favorite = get().favorites.find((f) => f.patternId === patternId);
        return favorite?.tagIds || [];
      },
    }),
    {
      name: 'favorite-storage',
      partialize: (state) => ({
        tags: state.tags,
        favorites: state.favorites,
      }),
    }
  )
);
