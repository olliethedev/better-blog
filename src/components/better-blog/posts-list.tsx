import type { Post } from '../../lib/better-blog/core/types';
import { PostCard } from './post-card';

interface PostsListProps {
  posts: Post[];
}

export function PostsList({ posts }: PostsListProps) {
  if (posts.length === 0) {
    return <div>No posts found.</div>;
  }

  return (
    <div className="posts-grid bg-blue-500">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} canEdit={false} />
      ))}
    </div>
  );
}