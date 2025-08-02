import React from 'react';
import { BetterBlogCore } from '@/lib/better-blog/core';
import type { BetterBlogConfig, Post } from '@/lib/better-blog/core/types';
import { PostsList } from '@/components/better-blog/posts-list';
import {  PostsLoading, PostLoading } from '@/components/better-blog/loading';

export interface RouterDependencies {
  useParams: () => { '*'?: string };
  Navigate: React.ComponentType<{ 
    to: string; 
    replace?: boolean;
  }>;
}

export interface ReactRouterBetterBlogAdapter {
  BlogRouter: React.ComponentType;
  generateRoutes: () => Array<{
    path: string;
    element: React.ReactElement;
  }>;
}

export function createReactRouterAdapter(
  config: BetterBlogConfig,
  router: RouterDependencies
): ReactRouterBetterBlogAdapter {
  const blog = new BetterBlogCore(config);

  function BlogRouter() {
    const params = router.useParams();
    const slug = params['*']?.split('/').filter(Boolean) || [];
    
    return <BlogEntryContent slug={slug} blog={blog} Navigate={router.Navigate} />;
  }

  function generateRoutes() {
    return [
      {
        path: '/posts/*',
        element: <BlogRouter />,
      },
    ];
  }

  return {
    BlogRouter,
    generateRoutes,
  };
}

function BlogEntryContent({
  slug,
  blog,
  Navigate,
}: {
  slug: string[];
  blog: BetterBlogCore;
  Navigate: React.ComponentType<{ to: string; replace?: boolean }>;
}) {
  const match = blog.matchRoute(slug);

  switch (match.type) {
    case 'home':
      return (
        <div>
          <h1>Blog Posts</h1>
          <HomePageSPA blog={blog} />
        </div>
      );

    case 'post':
      return <PostPageSPA blog={blog} slug={match.data!.slug!} Navigate={Navigate} />;

    case 'tag':
      return (
        <div>
          <h1>Posts tagged: #{match.data!.tag}</h1>
          <TagPageSPA blog={blog} tag={match.data!.tag!} />
        </div>
      );

    case 'new':
      return <div>✏️ Create New Post</div>;

    case 'drafts':
      return (
        <div>
          <h1>📝 My Drafts</h1>
          <DraftsPageSPA blog={blog} />
        </div>
      );

    case 'edit':
      return <div>✏️ Editing: {match.data!.postSlug}</div>;

    default:
      return <Navigate to="/posts" replace />;
  }
}

// SPA components with loading states
function HomePageSPA({ blog }: { blog: BetterBlogCore }) {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    blog.getPosts().then(setPosts).finally(() => setLoading(false));
  }, []);

  if (loading) return <PostsLoading />;
  return <PostsList posts={posts} />;
}

function PostPageSPA({ 
  blog, 
  slug, 
  Navigate 
}: { 
  blog: BetterBlogCore; 
  slug: string;
  Navigate: React.ComponentType<{ to: string; replace?: boolean }>;
}) {
  const [post, setPost] = React.useState<Post | null>(null);
  const [loading, setLoading] = React.useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    blog.getPostBySlug(slug).then(setPost).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PostLoading />;
  if (!post) return <Navigate to="/posts" replace />;
  
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
      <div>
        {post.content}
      </div>
    </article>
  );
}

function TagPageSPA({ blog, tag }: { blog: BetterBlogCore; tag: string }) {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    blog.getPostsByTag(tag).then(setPosts).finally(() => setLoading(false));
  }, [tag]);

  if (loading) return <PostsLoading />;
  return <PostsList posts={posts} />;
}

function DraftsPageSPA({ blog }: { blog: BetterBlogCore }) {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    blog.getPosts({ slug: 'drafts' }).then(setPosts).finally(() => setLoading(false));
  }, []);

  if (loading) return <PostsLoading />;
  return <PostsList posts={posts} />;
}