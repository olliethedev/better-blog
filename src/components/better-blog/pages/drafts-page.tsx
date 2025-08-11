"use client";

import { useDrafts } from "../../../lib/better-blog/hooks";
import { PostsLoading } from "../loading";
import { PostsList } from "../posts-list";

export function DraftsPageComponent() {
  const { drafts, isLoading, loadMore, hasMore, isLoadingMore } = useDrafts();

  if (isLoading) return <PostsLoading />;

  return (
    <div>
      <h1>📝 My Drafts</h1>
      <PostsList
        posts={drafts}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />
    </div>
  );
}


