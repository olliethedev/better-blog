"use client";

import { useRoute } from "../../../lib/better-blog/context/route-context";
import { useTagPosts } from "../../../lib/better-blog/hooks";
import { PostsLoading } from "../loading";
import { PostsList } from "../posts-list";

export function TagPageComponent() {
  const { routeMatch } = useRoute();
  const tag = routeMatch.params?.tag || "unknown";
  const { posts, isLoading, loadMore, hasMore, isLoadingMore } = useTagPosts(tag);

  if (isLoading) return <PostsLoading />;

  return (
    <div>
        <h1>Posts tagged: {tag}</h1>
        <PostsList
            posts={posts}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
        />
    </div>
)
}


