"use client";

import { useBlogContext, BlogContextProvider } from '../../lib/better-blog/context/blog-context';
import { PostsList } from './posts-list';
import { BlogLoading, PostLoading, PostsLoading } from './loading';
import { matchRoute } from '../../lib/better-blog/core/router';
import type { Post, RouteMatch, BlogDataProvider } from '../../lib/better-blog/core/types';


function PostDetail({ post }: { post: Post }) {
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

function NewPostForm() {
  return (
    <div>
      <h1>✏️ Create New Post</h1>
      <p>New post form will be implemented here</p>
    </div>
  );
}

function EditPostForm({ post }: { post: Post }) {
  return (
    <div>
      <h1>✏️ Editing: {post.title}</h1>
      <p>Edit form will be implemented here</p>
    </div>
  );
}

function NotFoundPage({ message }: { message: string }) {
  return (
    <div>
      <h1>Not Found</h1>
      <p>{message}</p>
    </div>
  );
}

function ErrorPage({ error }: { error: Error }) {
  return (
    <div>
      <h1>Error</h1>
      <p>Something went wrong: {error.message}</p>
    </div>
  );
}

// Internal component that renders based on routeMatch
function BlogRouterPageContent({routeMatch}: {routeMatch: RouteMatch}) {
  const {  data, isLoading, error } = useBlogContext();

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (isLoading) {
    // Show appropriate loading state based on route type
    switch (routeMatch.type) {
      case 'post':
        return <PostLoading />;
      case 'home':
        return <PostsLoading />;
      default:
        return <BlogLoading />;
    }
  }

  switch (routeMatch.type) {
    case 'home':
      return (
        <div>
          <h1>Blog Posts</h1>
          <PostsList posts={Array.isArray(data) ? data : []} />
        </div>
      );

    case 'post':
      if (!data || typeof data !== 'object' || !('title' in data)) {
        return <NotFoundPage message="Post not found" />;
      }
      return <PostDetail post={data as Post} />;

    
    default:
      return <NotFoundPage message={routeMatch.metadata.title} />;
  }
}

// Main component that takes slug and handles routing + context internally
export function BlogRouterPage({
  slug = [],
  clientConfig
}: {
  slug?: string[];
  clientConfig?: BlogDataProvider;
}) {
  const routeMatch = matchRoute(slug);

  return (
    <BlogContextProvider routeMatch={routeMatch} clientConfig={clientConfig}>
      <BlogRouterPageContent routeMatch={routeMatch} />
    </BlogContextProvider>
  );
}

