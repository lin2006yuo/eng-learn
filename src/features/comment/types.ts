export type RootType = 'pattern' | 'article' | 'post' | 'note';

export type CommentTargetType = RootType | 'comment';

export interface Comment {
  id: string;
  targetType: CommentTargetType;
  targetId: string;
  rootType: RootType;
  rootId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
  replyCount?: number;
  replyToUserName?: string;
}

export type NotificationType = 'comment_reply' | 'like' | 'follow';

export interface NotificationItem {
  id: string;
  userId: string;
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  type: NotificationType;
  commentId: string | null;
  commentContent?: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface CreateCommentRequest {
  targetType: CommentTargetType;
  targetId: string;
  rootType: RootType;
  rootId: string;
  content: string;
  replyToUserId?: string;
}

export type CommentQueryMode = 'byRoot' | 'byUser' | 'byReplies';

export interface CommentListQuery {
  rootType?: RootType;
  rootId?: string;
  userId?: string;
  cursor?: string;
  limit?: number;
  sort?: 'newest' | 'hottest';
}

export interface CommentListResponse {
  data: Comment[];
  totalCount: number;
  nextCursor?: string;
  hasMore: boolean;
}

export interface NotificationListResponse {
  data: NotificationItem[];
  totalCount: number;
  nextCursor?: string;
  hasMore: boolean;
}

export interface CommentLikeResponse {
  isLiked: boolean;
  likes: number;
}

export interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
}
