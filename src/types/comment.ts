// 评论相关类型定义

/**
 * 评论数据结构
 * 预留扩展字段：parentId（回复功能）、attachments（图片附件）
 */
export interface Comment {
  id: string;
  patternId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  // 扩展字段（预留）
  parentId?: string | null;
  replyTo?: string | null;
  attachments?: CommentAttachment[];
}

/**
 * 评论附件（预留，用于后续图片评论功能）
 */
export interface CommentAttachment {
  id: string;
  type: 'image';
  url: string;
  thumbnailUrl?: string;
}

/**
 * 创建评论请求参数
 */
export interface CreateCommentRequest {
  patternId: string;
  content: string;
  parentId?: string;
}

/**
 * 评论列表查询参数
 */
export interface CommentListQuery {
  patternId: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'time' | 'hot';
}

/**
 * 评论列表响应（支持分页扩展）
 */
export interface CommentListResponse {
  list: Comment[];
  total: number;
  hasMore: boolean;
  // 扩展字段
  nextCursor?: string;
}

/**
 * 当前用户信息（简化版，后续对接真实用户系统）
 */
export interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
}
