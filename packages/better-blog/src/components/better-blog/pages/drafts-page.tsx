"use client"

import { useBlogContext } from "@/hooks/context-hooks"
import { useSuspenseDrafts } from "../../../hooks"
import { PageHeader } from "../page-header"
import { PostsList } from "../posts-list"
import { PageWrapper } from "./page-wrapper"

export function DraftsPageComponent() {
    const { drafts, loadMore, hasMore, isLoadingMore } = useSuspenseDrafts()

    const { localization } = useBlogContext()

    return (
        <PageWrapper testId="drafts-page">
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
