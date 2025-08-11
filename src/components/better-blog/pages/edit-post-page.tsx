"use client";

import { useRoute } from "../../../lib/better-blog/context/route-context";
import { usePost } from "../../../lib/better-blog/hooks";
import { PostLoading } from "../loading";

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


