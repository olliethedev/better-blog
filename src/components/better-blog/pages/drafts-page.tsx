"use client"

import { useBlogContext } from "@/context/better-blog-context"
import { useDrafts } from "../../../hooks"
import { ErrorPlaceholder } from "../error-placeholder"
import { PostsLoading } from "../loading"
import { PageHeader } from "../page-header"
import { PostsList } from "../posts-list"
import { PageWrapper } from "./page-wrapper"

export function DraftsPageComponent() {
    const { drafts, isLoading, error, loadMore, hasMore, isLoadingMore } =
        useDrafts()

    const { localization } = useBlogContext()

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
                    title={localization.BLOG_LIST_DRAFTS_TITLE}
                    description={localization.BLOG_LIST_DRAFTS_DESCRIPTION}
                />
            </div>

            <PostsList
                posts={drafts}
                onLoadMore={loadMore}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
            />
        </PageWrapper>
    )
}
