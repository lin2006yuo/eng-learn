export interface ArticleAuthor {
  id: string;
  name: string;
  nickname: string;
  image?: string;
}

export interface ArticleListItem {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  wordCount: number;
  readingMinutes: number;
  author: ArticleAuthor;
}

export interface ArticleDetail extends ArticleListItem {
  content: string;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
}

export interface ArticleListResponse {
  data: ArticleListItem[];
}

export interface ArticleDetailResponse {
  data: ArticleDetail;
}
