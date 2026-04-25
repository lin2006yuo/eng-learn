import { Card } from '@/shared/components';
import { parseArticlePath, ArticleField } from '@/shared/utils/blockId';
import type { PostDetailData } from '../types';
import { PostMeta } from './PostMeta';
import { PostSelectableBody } from './PostSelectableBody';

interface PostDetailProps {
  post: PostDetailData;
}

export function PostDetail({ post }: PostDetailProps) {
  return (
    <div className="post-detail-container space-y-4">
      <Card className="post-detail-header">
        <div className="post-detail-badge mb-4 inline-flex rounded-badge bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          交流帖子
        </div>
        <h1 className="post-detail-title mb-3 text-3xl font-bold leading-tight text-text-primary">
          {post.title}
        </h1>
        <PostMeta
          authorName={post.authorName}
          publishedAt={post.publishedAt}
          status={post.status}
          viewCount={post.viewCount}
        />
      </Card>

      <Card className="post-detail-body">
        <PostSelectableBody
          rootId={post.id}
          dataPath={parseArticlePath(ArticleField.Content)}
          text={post.content}
        />
      </Card>
    </div>
  );
}
