"use client"

import { useBlogContext } from "@/hooks/context-hooks"
import { useRoute } from "@/hooks/context-hooks"
import { useSuspensePosts } from "../../../hooks"
import { PageHeader } from "../page-header"
import { PostsList } from "../posts-list"
import { PageWrapper } from "./page-wrapper"

export function TagPageComponent() {
    const { routeMatch } = useRoute()
    const tag = routeMatch.params?.tag || "unknown"
    const { posts, loadMore, hasMore, isLoadingMore } = useSuspensePosts({
        tag
    })

    const { localization } = useBlogContext()

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
