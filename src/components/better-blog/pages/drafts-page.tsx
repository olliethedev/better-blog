"use client"

import { useDrafts } from "../../../lib/better-blog/hooks"
import { PostsLoading } from "../loading"
import { PostsList } from "../posts-list"

export function DraftsPageComponent() {
    const { drafts, isLoading, error, loadMore, hasMore, isLoadingMore } =
        useDrafts()

    if (isLoading) return <PostsLoading />

    if (error) {
        return (
            <div className="space-y-4">
                <h2 className="font-semibold text-destructive">
                    Failed to load drafts
                </h2>
                <pre className="overflow-auto rounded bg-muted p-3 text-sm">
                    {error.message}
                </pre>
            </div>
        )
    }

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
    )
}
