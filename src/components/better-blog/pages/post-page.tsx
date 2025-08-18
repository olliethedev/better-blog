"use client";

import { useRoute } from "../../../lib/better-blog/context/route-context";
import { usePost } from "../../../lib/better-blog/hooks";
import { PostLoading } from "../loading";
import { MarkdownContent } from "../markdown-content"

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
        <MarkdownContent markdown={post.content} />
    </article>
)
}


