import type { PostSummary } from '../types';
import { PostCard } from './PostCard';

interface PostListProps {
  posts: PostSummary[];
}

export function PostList({ posts }: PostListProps) {
  return (
    <div className="post-list-container space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
