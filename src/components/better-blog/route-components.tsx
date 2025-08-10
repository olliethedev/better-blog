"use client";

import type React from 'react';
import { PostsList } from './posts-list';
import { BlogLoading, PostLoading, PostsLoading } from './loading';
import { 
  usePosts, 
  usePost, 
  useTagPosts, 
  useDrafts,
} from '../../lib/better-blog/hooks';
import { useRoute } from '../../lib/better-blog/context/route-context';
import { useBetterBlogContext } from '@/lib/better-blog/context/better-blog-context';

// ============================================================================
// ZERO-PROP ROUTE COMPONENTS - PURE REACTIVE FUNCTIONS!
// ============================================================================

export function HomePageComponent() {
  const { posts, isLoading, loadMore, hasMore, isLoadingMore } = usePosts();
  const { localization } = useBetterBlogContext();
  
  if (isLoading) return <PostsLoading />;
  
  return (
    <div className="container mx-auto px-4">
      <h1>{localization.BLOG_LIST_TITLE}</h1>
      <PostsList 
        posts={posts} 
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />
    </div>
  );
}

export function PostPageComponent() {
  const { routeMatch } = useRoute();
  const { post, isLoading, error } = usePost(routeMatch.params?.slug);
  
  if (isLoading) return <PostLoading />;
  
  if (error || !post) {
    return (
      <div>
        <h1>Not Found</h1>
        <p>Post not found</p>
      </div>
    );
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div className="post-meta">
        <span>By {post.author.name}</span>
        <span>{post.createdAt.toLocaleDateString()}</span>
      </div>
      <div className="post-tags">
        {post.tags.map((tag) => (
          <span key={tag.id} className="tag">
            #{tag.name}
          </span>
        ))}
      </div>
      <div className="post-content">
        {post.content}
      </div>
    </article>
  );
}

export function TagPageComponent() {
  const { routeMatch } = useRoute();
  const tag = routeMatch.params?.tag || 'unknown';
  const { posts, isLoading, loadMore, hasMore, isLoadingMore } = useTagPosts(tag);
  
  if (isLoading) return <PostsLoading />;
  
  return (
    <div>
      <h1>Posts tagged: {tag}</h1>
      <PostsList 
        posts={posts} 
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />
    </div>
  );
}

export function DraftsPageComponent() {
  const { drafts, isLoading, loadMore, hasMore, isLoadingMore } = useDrafts();
  
  if (isLoading) return <PostsLoading />;
  
  return (
    <div>
      <h1>📝 My Drafts</h1>
      <PostsList 
        posts={drafts} 
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />
    </div>
  );
}

export function NewPostPageComponent() {
  // This component doesn't need data - it's for creating new posts
  // Future: Could use useCreatePost() hook here
  return (
    <div>
      <h1>✏️ Create New Post</h1>
      <p>New post form will be implemented here</p>
    </div>
  );
}

export function EditPostPageComponent() {
  const { routeMatch } = useRoute();
  const { post, isLoading, error } = usePost(routeMatch.params?.slug);
  
  if (isLoading) return <PostLoading />;
  
  if (error || !post) {
    return (
      <div>
        <h1>Not Found</h1>
        <p>Post not found for editing</p>
      </div>
    );
  }

  return (
    <div>
      <h1>✏️ Editing: {post.title}</h1>
      <p>Edit form will be implemented here</p>
    </div>
  );
}

// Loading components mapping
export const loadingComponents: Record<string, React.ComponentType<Record<string, never>>> = {
  home: PostsLoading,
  post: PostLoading,
  tag: PostsLoading,
  drafts: PostsLoading,
  new: BlogLoading,
  edit: PostLoading,
};
