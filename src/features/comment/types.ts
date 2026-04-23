export type RootType = 'pattern' | 'article' | 'post' | 'note';

export type CommentTargetType = RootType | 'comment';

export type CommentAnchorStatus = 'active' | 'relocated' | 'orphaned';

export interface CommentAnchorExtra {
  blockId?: string;
}

export interface CommentAnchor {
  id: string;
  commentId: string;
  rootType: RootType;
  rootId: string;
  selectedText: string;
  startOffset: number;
  endOffset: number;
  prefixText: string;
  suffixText: string;
  extra: CommentAnchorExtra;
  anchorStatus: CommentAnchorStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCommentAnchorRequest {
  rootType: RootType;
  rootId: string;
  selectedText: string;
  startOffset: number;
  endOffset: number;
  prefixText: string;
  suffixText: string;
  extra?: CommentAnchorExtra;
}

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
  anchor?: CommentAnchor;
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
  anchor?: CreateCommentAnchorRequest;
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
