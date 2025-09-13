"use client"

import { PostsLoading } from "@/components/better-blog/loading"
import { PageHeader } from "@/components/better-blog/page-header"
import { PageWrapper } from "@/components/better-blog/pages/page-wrapper"
import { PostsList } from "@/components/better-blog/posts-list"

import { useBlogContext } from "@/context/better-blog-context"
import { usePosts } from "@/hooks"
import { ErrorPlaceholder } from "../error-placeholder"

export function HomePageComponent() {
    const { posts, isLoading, error, loadMore, hasMore, isLoadingMore } =
        usePosts({})
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
                    title={localization.BLOG_LIST_TITLE}
                    description={localization.BLOG_LIST_DESCRIPTION}
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
