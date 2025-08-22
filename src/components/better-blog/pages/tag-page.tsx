"use client"

import { useRoute } from "../../../lib/better-blog/context/route-context"
import { useTagPosts } from "../../../lib/better-blog/hooks"
import { PostsLoading } from "../loading"
import { PostsList } from "../posts-list"

export function TagPageComponent() {
    const { routeMatch } = useRoute()
    const tag = routeMatch.params?.tag || "unknown"
    const { posts, isLoading, error, loadMore, hasMore, isLoadingMore } =
        useTagPosts(tag)

    if (isLoading) return <PostsLoading />

    if (error) {
        return (
            <div className="space-y-4">
                <h2 className="font-semibold text-destructive">
                    Failed to load tag posts
                </h2>
                <pre className="overflow-auto rounded bg-muted p-3 text-sm">
                    {error.message}
                </pre>
            </div>
        )
    }

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
