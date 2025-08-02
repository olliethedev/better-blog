import { Suspense } from 'react';
import { BetterBlogCore } from '../core';
import type { BetterBlogConfig } from '../core/types';
import { BlogLoading, PostLoading, PostsLoading } from '../../../components/better-blog/loading';
import { PostsList } from '../../../components/better-blog/posts-list';

export interface NextJsBetterBlogAdapter {
  dynamicParams: boolean;
  generateStaticParams: () => Array<{ all: string[] }>;
  generateMetadata: (context: {
    params: Promise<{ all: string[] }>;
  }) => Promise<{ title: string; description?: string }>;
  Entry: React.ComponentType<{
    params: Promise<{ all: string[] }>;
  }>;
}

export function createNextJsAdapter(
  config: BetterBlogConfig
): NextJsBetterBlogAdapter {
  const blog = new BetterBlogCore(config);

  return {
    dynamicParams: true,

    generateStaticParams() {
      const staticRoutes = blog.getStaticRoutes();
      return staticRoutes.map(route => ({ all: route.slug }));
    },

    async generateMetadata({ params }) {
      const { all: slug } = await params;
      const match = blog.matchRoute(slug);
      return {
        title: match.metadata.title,
        description: match.metadata.description,
      };
    },

    Entry: function BlogEntry({ params }) {
      return (
        <Suspense fallback={<BlogLoading />}>
          <BlogEntryContent params={params} blog={blog} />
        </Suspense>
      );
    },
  };
}

async function BlogEntryContent({
  params,
  blog,
}: {
  params: Promise<{ all: string[] }>;
  blog: BetterBlogCore;
}) {
  const { all: slug } = await params;
  const match = blog.matchRoute(slug);

  switch (match.type) {
    case 'home':
      return (
        <div>
          <h1>Blog Posts</h1>
          <Suspense fallback={<PostsLoading />}>
            <HomePageAsync blog={blog} />
          </Suspense>
        </div>
      );

    case 'post':
      return (
        <Suspense fallback={<PostLoading />}>
          <PostPageAsync blog={blog} slug={match.data!.slug!} />
        </Suspense>
      );

    case 'tag':
      return (
        <div>
          <h1>Posts tagged: #{match.data!.tag}</h1>
          <Suspense fallback={<PostsLoading />}>
            <TagPageAsync blog={blog} tag={match.data!.tag!} />
          </Suspense>
        </div>
      );

    case 'new':
      return <div>✏️ Create New Post</div>;

    case 'drafts':
      return (
        <div>
          <h1>📝 My Drafts</h1>
          <Suspense fallback={<PostsLoading />}>
            <DraftsPageAsync blog={blog} />
          </Suspense>
        </div>
      );

    case 'edit':
      return <div>✏️ Editing: {match.data!.postSlug}</div>;

    default:
      return <div>❓ {match.metadata.title}</div>;
  }
}

// Async components for Suspense boundaries
async function HomePageAsync({ blog }: { blog: BetterBlogCore }) {
  const posts = await blog.getPosts();
  return <PostsList posts={posts} />;
}

async function PostPageAsync({ 
  blog, 
  slug 
}: { 
  blog: BetterBlogCore; 
  slug: string; 
}) {
  const post = await blog.getPostBySlug(slug);
  if (!post) {
    return <div>Post not found</div>;
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
      <div>
        {post.content}
      </div>
    </article>
  );
}

async function TagPageAsync({ 
  blog, 
  tag 
}: { 
  blog: BetterBlogCore; 
  tag: string; 
}) {
  const posts = await blog.getPostsByTag(tag);
  return <PostsList posts={posts} />;
}

async function DraftsPageAsync({ blog }: { blog: BetterBlogCore }) {
  const drafts = await blog.getPosts({ slug: 'drafts' });
  return <PostsList posts={drafts} />;
}

// Legacy compatibility
export const BetterBlog = createNextJsAdapter;