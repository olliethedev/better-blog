import type { Post } from '../../lib/better-blog/core/types';
import { PostCard } from './post-card';
import { Button } from '../ui/button';
import { useBetterBlogContext } from '@/lib/better-blog/context/better-blog-context';

interface PostsListProps {
  posts: Post[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function PostsList({ posts, onLoadMore, hasMore, isLoadingMore }: PostsListProps) {
  const { localization } = useBetterBlogContext();
  if (posts.length === 0) {
    return <div>No posts found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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