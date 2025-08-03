import React from 'react';
import { BetterBlogCore } from '@/lib/better-blog/core';
import type { BetterBlogConfig, Post } from '@/lib/better-blog/core/types';
import { PostsList } from '@/components/better-blog/posts-list';
import { PostsLoading, PostLoading } from '@/components/better-blog/loading';

export interface DefaultBetterBlogAdapter {
  BlogRouter: React.ComponentType<{ 
    currentPath: string;
    onNavigate?: (path: string) => void;
  }>;
}

export function createDefaultAdapter(
  config: BetterBlogConfig
): DefaultBetterBlogAdapter {
  const blog = new BetterBlogCore(config);

  function BlogRouter({ 
    currentPath, 
    onNavigate 
  }: { 
    currentPath: string;
    onNavigate?: (path: string) => void;
  }) {
    const slug = currentPath.replace('/posts/', '').split('/').filter(Boolean);
    
    return (
      <BlogEntryContent 
        slug={slug} 
        blog={blog} 
        onNavigate={onNavigate} 
      />
    );
  }

  return {
    BlogRouter,
  };
}

function BlogEntryContent({
  slug,
  blog,
  onNavigate,
}: {
  slug: string[];
  blog: BetterBlogCore;
  onNavigate?: (path: string) => void;
}) {
  const match = blog.matchRoute(slug);

  // Simple navigation component for default adapter
  function Navigate({ to }: { to: string }) {
    React.useEffect(() => {
      if (onNavigate) {
        onNavigate(to);
      } else {
        // Fallback to changing window location
        window.location.href = to;
      }
    }, [to, onNavigate]);
    return null;
  }

  switch (match.type) {
    case 'home':
      return (
        <div>
          <h1>Blog Posts</h1>
          <HomePageDefault blog={blog} />
        </div>
      );

    case 'post':
      return <PostPageDefault blog={blog} slug={match.data!.slug!} Navigate={Navigate} />;

    case 'tag':
      return (
        <div>
          <h1>Posts tagged: #{match.data!.tag}</h1>
          <TagPageDefault blog={blog} tag={match.data!.tag!} />
        </div>
      );

    case 'new':
      return <div>✏️ Create New Post</div>;

    case 'drafts':
      return (
        <div>
          <h1>📝 My Drafts</h1>
          <DraftsPageDefault blog={blog} />
        </div>
      );

    case 'edit':
      return <div>✏️ Editing: {match.data!.postSlug}</div>;

    default:
      return <Navigate to="/posts" />;
  }
}

// Default components with loading states
function HomePageDefault({ blog }: { blog: BetterBlogCore }) {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    blog.getPosts().then(setPosts).finally(() => setLoading(false));
  }, [blog]);

  if (loading) return <PostsLoading />;
  return <PostsList posts={posts} />;
}

function PostPageDefault({ 
  blog, 
  slug, 
  Navigate 
}: { 
  blog: BetterBlogCore; 
  slug: string;
  Navigate: React.ComponentType<{ to: string }>;
}) {
  const [post, setPost] = React.useState<Post | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    blog.getPostBySlug(slug).then(setPost).finally(() => setLoading(false));
  }, [blog, slug]);

  if (loading) return <PostLoading />;
  if (!post) return <Navigate to="/posts" />;
  
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

function TagPageDefault({ blog, tag }: { blog: BetterBlogCore; tag: string }) {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    blog.getPostsByTag(tag).then(setPosts).finally(() => setLoading(false));
  }, [blog, tag]);

  if (loading) return <PostsLoading />;
  return <PostsList posts={posts} />;
}

function DraftsPageDefault({ blog }: { blog: BetterBlogCore }) {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    blog.getPosts({ slug: 'drafts' }).then(setPosts).finally(() => setLoading(false));
  }, [blog]);

  if (loading) return <PostsLoading />;
  return <PostsList posts={posts} />;
}