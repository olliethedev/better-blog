import type { Post } from '../../lib/better-blog/core/types';
import { PostCard } from './post-card';
import { Button } from '../ui/button';

interface PostsListProps {
  posts: Post[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function PostsList({ posts, onLoadMore, hasMore, isLoadingMore }: PostsListProps) {
  if (posts.length === 0) {
    return <div>No posts found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="posts-grid bg-blue-500">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} canEdit={false} />
        ))}
      </div>
      
      {onLoadMore && hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            size="lg"
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}