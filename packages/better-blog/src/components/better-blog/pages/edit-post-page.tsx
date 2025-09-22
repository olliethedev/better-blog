"use client"

import { useBlogContext } from "@/hooks/context-hooks"
import { useRoute } from "@/hooks/context-hooks"
import { useSuspensePost } from "../../../hooks"
import { EmptyList } from "../empty-list"
import { EditPostForm } from "../forms/post-forms"
import { PageHeader } from "../page-header"
import { PageWrapper } from "./page-wrapper"

export function EditPostPageComponent() {
    const { routeMatch } = useRoute()
    const slug = routeMatch.params?.slug
    const { post } = slug ? useSuspensePost(slug) : { post: null }
    const { localization } = useBlogContext()

    if (!post) {
        return <EmptyList message={localization.POST_NOT_FOUND_DESCRIPTION} />
    }

    return (
        <PageWrapper className="gap-6">
            <PageHeader
                title={localization.BLOG_POST_EDIT_TITLE}
                description={localization.BLOG_POST_EDIT_DESCRIPTION}
            />
            <EditPostForm
                postSlug={post.slug}
                onClose={() => {}}
                onSuccess={() => {}}
            />
        </PageWrapper>
    )
}
