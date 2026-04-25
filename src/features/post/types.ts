export type PostStatus = 'draft' | 'published' | 'archived';

export interface PostSummary {
  id: string;
  title: string;
  status: PostStatus;
  authorId: string;
  authorName: string;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostDetailData extends PostSummary {
  content: string;
}

export interface PostListResponse {
  data: PostSummary[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface PostDetailResponse {
  data: PostDetailData;
}

export interface PostFormValues {
  title: string;
  content: string;
  status: PostStatus;
}
