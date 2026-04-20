import { create } from 'zustand';
import type { Comment, CommentListResponse, CreateCommentRequest } from '../types';
import { commentBus } from '@/shared/utils/eventBus';
import { apiGet, apiPost, apiDelete } from '@/shared/utils/api';

export interface CommentStats {
  count: number;
  preview: Comment[];
}

interface CommentState {
  comments: Record<string, Comment[]>;
  loading: boolean;
  error: string | null;
  sortBy: 'newest' | 'hottest';
  fetchingTargetIds: Set<string>;
  fetchComments: (rootType: string, rootId: string) => Promise<void>;
  getCommentStats: (rootType: string, rootId: string) => CommentStats;
  createComment: (request: CreateCommentRequest) => Promise<boolean>;
  deleteComment: (commentId: string, rootType: string, rootId: string) => Promise<boolean>;
  toggleLike: (commentId: string, rootType: string, rootId: string) => Promise<void>;
  setSortBy: (sortBy: 'newest' | 'hottest') => void;
  loadMoreComments: (rootType: string, rootId: string) => Promise<void>;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function updateCommentInTree(
  comments: Comment[],
  commentId: string,
  updater: (c: Comment) => Partial<Comment>
): Comment[] {
  return comments.map((c) => {
    if (c.id === commentId) return { ...c, ...updater(c) };
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: updateCommentInTree(c.replies, commentId, updater) };
    }
    return c;
  });
}

function removeCommentFromTree(
  comments: Comment[],
  commentId: string
): Comment[] {
  return comments
    .filter((c) => c.id !== commentId)
    .map((c) => ({
      ...c,
      replies: c.replies ? removeCommentFromTree(c.replies, commentId) : undefined,
    }));
}

function addReplyToTree(
  comments: Comment[],
  targetCommentId: string,
  newComment: Comment
): Comment[] {
  return comments.map((c) => {
    if (c.id === targetCommentId) {
      return { ...c, replies: [...(c.replies || []), newComment], replyCount: (c.replyCount || 0) + 1 };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: addReplyToTree(c.replies, targetCommentId, newComment) };
    }
    return c;
  });
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: {},
  loading: false,
  error: null,
  sortBy: 'newest',
  fetchingTargetIds: new Set(),

  fetchComments: async (rootType: string, rootId: string) => {
    const key = `${rootType}-${rootId}`;
    if (get().fetchingTargetIds.has(key)) return;

    const newSet = new Set(get().fetchingTargetIds);
    newSet.add(key);
    set({ fetchingTargetIds: newSet, loading: true, error: null });

    try {
      const result = await apiGet<CommentListResponse>(
        '/api/comments',
        { rootType, rootId, limit: '20' }
      );

      set((state) => {
        const cleanSet = new Set(state.fetchingTargetIds);
        cleanSet.delete(key);
        if (!result.ok || !result.data) {
          return { error: '加载评论失败', loading: false, fetchingTargetIds: cleanSet };
        }
        return {
          comments: { ...state.comments, [key]: result.data.data },
          loading: false,
          fetchingTargetIds: cleanSet,
        };
      });
    } catch {
      set((state) => {
        const cleanSet = new Set(state.fetchingTargetIds);
        cleanSet.delete(key);
        return { error: '加载评论失败', loading: false, fetchingTargetIds: cleanSet };
      });
    }
  },

  createComment: async (request: CreateCommentRequest): Promise<boolean> => {
    const result = await apiPost<{ data: Comment }>('/api/comments', request);
    if (!result.ok || !result.data) return false;

    const newComment = result.data.data;
    const key = `${request.rootType}-${request.rootId}`;

    set((state) => {
      const list = state.comments[key] || [];

      if (request.targetType === 'comment') {
        return {
          comments: {
            ...state.comments,
            [key]: addReplyToTree(list, request.targetId, newComment),
          },
        };
      }

      return {
        comments: {
          ...state.comments,
          [key]: [newComment, ...list],
        },
      };
    });

    commentBus.emit('commentChange', key);
    return true;
  },

  deleteComment: async (commentId: string, rootType: string, rootId: string): Promise<boolean> => {
    const result = await apiDelete(`/api/comments/${commentId}`);
    if (!result.ok) return false;

    const key = `${rootType}-${rootId}`;

    set((state) => ({
      comments: {
        ...state.comments,
        [key]: removeCommentFromTree(
          state.comments[key] || [],
          commentId
        ),
      },
    }));

    commentBus.emit('commentChange', key);
    return true;
  },

  toggleLike: async (commentId: string, rootType: string, rootId: string) => {
    const key = `${rootType}-${rootId}`;
    const previousState = get().comments;

    set((state) => ({
      comments: {
        ...state.comments,
        [key]: updateCommentInTree(
          state.comments[key] || [],
          commentId,
          (c) => ({
            isLiked: !c.isLiked,
            likes: c.isLiked ? c.likes - 1 : c.likes + 1,
          })
        ),
      },
    }));

    const result = await apiPost(`/api/comments/${commentId}/like`);
    if (!result.ok) {
      set({ comments: previousState });
    }
  },

  getCommentStats: (rootType: string, rootId: string): CommentStats => {
    const key = `${rootType}-${rootId}`;
    const list = get().comments[key] || [];
    return {
      count: list.reduce((sum, c) => sum + 1 + (c.replyCount || 0), 0),
      preview: list.slice(0, 2),
    };
  },

  setSortBy: (sortBy: 'newest' | 'hottest') => {
    set({ sortBy });
  },

  loadMoreComments: async (_rootType: string, _rootId: string) => {
  },
}));
