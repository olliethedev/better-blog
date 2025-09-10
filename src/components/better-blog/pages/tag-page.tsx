"use client"

import { useBetterBlogContext } from "@/lib/better-blog/context/better-blog-context"
import { useRoute } from "../../../lib/better-blog/context/route-context"
import { useTagPosts } from "../../../lib/better-blog/hooks"
import { ErrorPlaceholder } from "../error-placeholder"
import { PostsLoading } from "../loading"
import { PageHeader } from "../page-header"
import { PostsList } from "../posts-list"
import { PageWrapper } from "./page-wrapper"

export function TagPageComponent() {
    const { routeMatch } = useRoute()
    const tag = routeMatch.params?.tag || "unknown"
    const { posts, isLoading, error, loadMore, hasMore, isLoadingMore } =
        useTagPosts(tag)

    const { localization } = useBetterBlogContext()

    if (isLoading) return <PostsLoading />

    if (error) {
        return (
            <ErrorPlaceholder
                title={localization.BLOG_LIST_ERROR_TITLE}
                message={localization.BLOG_LIST_ERROR}
            />
        )
    }

    return (
        <PageWrapper>
            <div className="flex flex-col items-center gap-3">
                <PageHeader
                    title={localization.BLOG_LIST_TAG_TITLE.replace(
                        "{tag}",
                        tag
                    )}
                    description={localization.BLOG_LIST_TAG_DESCRIPTION.replace(
                        "{tag}",
                        tag
                    )}
                />
            </div>
            <PostsList
                posts={posts}
                onLoadMore={loadMore}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
            />
        </PageWrapper>
    )
}
