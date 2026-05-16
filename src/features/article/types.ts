export type ArticleStatus = 'draft' | 'published' | 'archived';
export type ArticleContentType = 'text' | 'html';

export interface ArticleSummary {
  id: string;
  title: string;
  summary: string;
  status: ArticleStatus;
  authorId: string;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleDetailData extends ArticleSummary {
  content: string;
  contentType: ArticleContentType;
}

export interface ArticleListResponse {
  data: ArticleSummary[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface ArticleDetailResponse {
  data: ArticleDetailData;
}

export interface ArticleFormValues {
  title: string;
  summary: string;
  content: string;
  contentType: ArticleContentType;
  status: ArticleStatus;
}
