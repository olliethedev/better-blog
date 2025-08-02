import type { Post } from '../../lib/better-blog/core/types';

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
        <article key={post.id} className="post-card">
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
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
        </article>
      ))}
    </div>
  );
}