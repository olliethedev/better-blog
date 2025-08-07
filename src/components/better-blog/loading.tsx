import type { RouteMatch } from "@/lib/better-blog/core/types";

export function BlogLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="blog-loading">
      <div className="loading-spinner">⏳</div>
      <p>{message}</p>
    </div>
  );
}

export function PostsLoading() {
  return <BlogLoading message="Loading posts..." />;
}

export function PostLoading() {
  return <BlogLoading message="Loading post..." />;
}

export const defaultLoadingComponents: Record<RouteMatch['type'], React.ComponentType<Record<string, never>>> = {
  home: PostsLoading,
  post: PostLoading,
  tag: PostsLoading,
  drafts: PostsLoading,
  new: BlogLoading,
  edit: PostLoading,
  unknown: BlogLoading,
} as const;