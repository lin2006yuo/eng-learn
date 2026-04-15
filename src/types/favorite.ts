/**
 * 收藏功能类型定义
 */

/**
 * 收藏标签
 */
export interface FavoriteTag {
  id: string;
  name: string;
  icon: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 收藏关系
 * 一个句型可以属于多个标签
 */
export interface Favorite {
  patternId: string;
  tagIds: string[];
  createdAt: number;
  updatedAt: number;
}

/**
 * 收藏状态（用于UI显示）
 */
export interface FavoriteStatus {
  isFavorited: boolean;
  tagIds: string[];
}

/**
 * 搜索模式
 */
export type SearchMode = 'text' | 'tag';

/**
 * 标签过滤状态
 */
export interface TagFilterState {
  activeTagId: string | null;
  isFilterMode: boolean;
}

/**
 * 标签统计信息
 */
export interface TagStats {
  tagId: string;
  count: number;
}
