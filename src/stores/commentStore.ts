import { create } from 'zustand';
import type { Comment, CommentListResponse, CreateCommentRequest, CurrentUser } from '@/types/comment';

/**
 * 模拟当前用户
 * 后续对接真实用户系统
 */
const MOCK_CURRENT_USER: CurrentUser = {
  id: 'user-001',
  name: '学习者',
  avatar: undefined,
};

/**
 * 模拟评论数据
 * 按 patternId 分组存储
 */
const MOCK_COMMENTS: Record<string, Comment[]> = {
  'pattern-1': [
    {
      id: 'comment-001',
      patternId: 'pattern-1',
      userId: 'user-002',
      userName: '小明',
      content: '这个句型很实用！日常自我介绍经常用',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 12,
      isLiked: false,
    },
    {
      id: 'comment-002',
      patternId: 'pattern-1',
      userId: 'user-003',
      userName: '小红',
      content: '可以换成 I\'m an engineer 吗？',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      likes: 3,
      isLiked: true,
    },
  ],
  'pattern-2': [
    {
      id: 'comment-003',
      patternId: 'pattern-2',
      userId: 'user-004',
      userName: '英语达人',
      content: 'be good at 后面接动名词形式，记得加 ing',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      likes: 28,
      isLiked: false,
    },
  ],
};

/**
 * 评论统计信息（用于首页展示）
 */
export interface CommentStats {
  count: number;
  preview: Comment[];
}

/**
 * 评论 Store 接口
 * 设计原则：
 * 1. 支持按 patternId 隔离评论数据
 * 2. 预留分页加载接口（loadMoreComments）
 * 3. 预留排序切换接口（setSortBy）
 * 4. 所有操作本地更新，后续可替换为 API 调用
 */
interface CommentState {
  // 数据
  comments: Record<string, Comment[]>;
  currentUser: CurrentUser;
  loading: boolean;
  error: string | null;

  // 查询参数（预留扩展）
  sortBy: 'time' | 'hot';

  // Actions
  /** 获取评论列表 */
  fetchComments: (patternId: string) => Promise<void>;

  /** 获取评论统计（用于首页预览） */
  getCommentStats: (patternId: string) => CommentStats;

  /** 发表评论 */
  createComment: (request: CreateCommentRequest) => Promise<void>;

  /** 删除评论 */
  deleteComment: (commentId: string, patternId: string) => Promise<void>;

  /** 点赞/取消点赞 */
  toggleLike: (commentId: string, patternId: string) => Promise<void>;

  /** 设置排序方式（预留） */
  setSortBy: (sortBy: 'time' | 'hot') => void;

  /** 获取更多评论（预留分页） */
  loadMoreComments: (patternId: string) => Promise<void>;
}

/**
 * 生成唯一 ID（简化版，后续使用 uuid）
 */
function generateId(): string {
  return `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 格式化时间（相对时间）
 */
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

export const useCommentStore = create<CommentState>((set, get) => ({
  // 初始状态
  comments: MOCK_COMMENTS,
  currentUser: MOCK_CURRENT_USER,
  loading: false,
  error: null,
  sortBy: 'time',

  /**
   * 获取评论列表
   * 当前使用 mock 数据，后续替换为 API 调用
   */
  fetchComments: async (patternId: string) => {
    set({ loading: true, error: null });

    try {
      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 如果 mock 数据中没有该 pattern 的评论，返回空数组
      const patternComments = get().comments[patternId] || [];

      // 按时间倒序排序
      const sortedComments = [...patternComments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      set((state) => ({
        comments: {
          ...state.comments,
          [patternId]: sortedComments,
        },
        loading: false,
      }));
    } catch (error) {
      set({ error: '加载评论失败', loading: false });
    }
  },

  /**
   * 发表评论
   * 本地更新，后续替换为 API 调用
   */
  createComment: async (request: CreateCommentRequest) => {
    const { patternId, content } = request;
    const { currentUser } = get();

    // 创建新评论
    const newComment: Comment = {
      id: generateId(),
      patternId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 本地更新：添加到列表头部
    set((state) => ({
      comments: {
        ...state.comments,
        [patternId]: [newComment, ...(state.comments[patternId] || [])],
      },
    }));
  },

  /**
   * 删除评论
   * 只能删除自己的评论
   */
  deleteComment: async (commentId: string, patternId: string) => {
    const { currentUser, comments } = get();
    const patternComments = comments[patternId] || [];

    // 找到评论并验证权限
    const comment = patternComments.find((c) => c.id === commentId);
    if (!comment || comment.userId !== currentUser.id) {
      throw new Error('无权删除该评论');
    }

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 本地更新：移除评论
    set((state) => ({
      comments: {
        ...state.comments,
        [patternId]: patternComments.filter((c) => c.id !== commentId),
      },
    }));
  },

  /**
   * 点赞/取消点赞
   */
  toggleLike: async (commentId: string, patternId: string) => {
    const { comments } = get();
    const patternComments = comments[patternId] || [];

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 本地更新：切换点赞状态
    set((state) => ({
      comments: {
        ...state.comments,
        [patternId]: patternComments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                isLiked: !c.isLiked,
                likes: c.isLiked ? c.likes - 1 : c.likes + 1,
              }
            : c
        ),
      },
    }));
  },

  /**
   * 获取评论统计（用于首页预览）
   * 返回评论总数和前2条预览
   */
  getCommentStats: (patternId: string): CommentStats => {
    const patternComments = get().comments[patternId] || [];
    // 按时间倒序取前2条
    const sortedComments = [...patternComments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      count: patternComments.length,
      preview: sortedComments.slice(0, 2),
    };
  },

  /**
   * 设置排序方式（预留）
   */
  setSortBy: (sortBy: 'time' | 'hot') => {
    set({ sortBy });
    // 触发重新排序
    const { comments } = get();
    const sortedComments: Record<string, Comment[]> = {};

    Object.keys(comments).forEach((patternId) => {
      const list = [...comments[patternId]];
      if (sortBy === 'time') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        // 按热度排序：点赞数 + 时间权重
        list.sort((a, b) => b.likes - a.likes);
      }
      sortedComments[patternId] = list;
    });

    set({ comments: sortedComments });
  },

  /**
   * 加载更多评论（预留分页）
   * 当前一次性返回所有数据，后续支持 cursor 分页
   */
  loadMoreComments: async (patternId: string) => {
    // 预留接口，当前不做任何操作
    // 后续实现：
    // 1. 获取 nextCursor
    // 2. 调用 API 加载更多
    // 3. 追加到列表末尾
  },
}));
