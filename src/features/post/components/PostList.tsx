import type { PostSummary } from '../types';
import { PostCard } from './PostCard';

interface PostListProps {
  posts: PostSummary[];
}

export function PostList({ posts }: PostListProps) {
  return (
    <div className="post-list-container">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className={`post-list-item ${index !== posts.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}
        >
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
}
