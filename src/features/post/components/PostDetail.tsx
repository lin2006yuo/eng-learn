import { parseArticlePath, ArticleField } from '@/shared/utils/blockId';
import type { PostDetailData } from '../types';
import { PostMeta } from './PostMeta';
import { PostSelectableBody } from './PostSelectableBody';

interface PostDetailProps {
  post: PostDetailData;
}

export function PostDetail({ post }: PostDetailProps) {
  return (
    <div className="post-detail-container">
      {/* Header Section */}
      <div className="post-detail-header pb-4 border-b border-[#E5E5EA]">
        <h1 className="post-detail-title text-[22px] font-bold leading-tight tracking-tight text-[#1D1D1F]">
          {post.title}
        </h1>
        <div className="post-detail-meta mt-4">
          <PostMeta
            authorName={post.authorName}
            publishedAt={post.publishedAt}
            status={post.status}
            viewCount={post.viewCount}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="post-detail-body py-6">
        <PostSelectableBody
          rootId={post.id}
          dataPath={parseArticlePath(ArticleField.Content)}
          text={post.content}
        />
      </div>
    </div>
  );
}
