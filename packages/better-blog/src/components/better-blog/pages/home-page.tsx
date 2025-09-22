"use client"

import { PageHeader } from "@/components/better-blog/page-header"
import { PageWrapper } from "@/components/better-blog/pages/page-wrapper"
import { PostsList } from "@/components/better-blog/posts-list"

import { useSuspensePosts } from "@/hooks"
import { useBlogContext } from "@/hooks/context-hooks"

export function HomePageComponent() {
    const { posts, loadMore, hasMore, isLoadingMore } = useSuspensePosts({})
    const { localization } = useBlogContext()

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
