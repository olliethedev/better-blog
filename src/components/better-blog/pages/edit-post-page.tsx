"use client";

import { useRoute } from "../../../lib/better-blog/context/route-context";
import { usePost } from "../../../lib/better-blog/hooks";
import { EditPostForm } from "../forms/post-forms"
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
        <EditPostForm
            postSlug={post.slug}
            onClose={() => {}}
            onSuccess={() => {}}
        />
    </div>
)
}


