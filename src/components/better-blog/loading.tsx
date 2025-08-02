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