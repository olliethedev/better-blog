"use client";

import { PostsLoading } from "../loading";
import { usePosts } from "../../../lib/better-blog/hooks";
import { useBetterBlogContext, useComponents, useBlogPath } from "@/lib/better-blog/context/better-blog-context";
import { PostCard } from "../post-card";
import { Button } from "../../ui/button";
import { ArrowRightIcon } from "lucide-react";

export function HomePageComponent() {
  const { posts, isLoading, loadMore, hasMore, isLoadingMore } = usePosts();
  const { localization } = useBetterBlogContext();
  const { Link } = useComponents();
  const newPostHref = useBlogPath("new");

  if (isLoading) return <PostsLoading />;

  const emptyMessage = localization.BLOG_LIST_EMPTY ?? "No posts found.";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{localization.BLOG_LIST_TITLE}</h1>
          {localization.BLOG_LIST_DESCRIPTION ? (
            <p className="text-muted-foreground mt-1">
              {localization.BLOG_LIST_DESCRIPTION}
            </p>
          ) : null}
        </div>
        <Button asChild>
          <Link href={newPostHref}>
            {localization.BLOG_LIST_NEW_POST_BUTTON ?? "New Post"}
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">{emptyMessage}</h3>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} canEdit={false} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                onClick={loadMore}
                disabled={isLoadingMore}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                    {localization.BLOG_LIST_LOADING_MORE ?? "Loading more..."}
                  </>
                ) : (
                  <>
                    {localization.BLOG_LIST_LOAD_MORE ?? "Load more posts"}
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}


