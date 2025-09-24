"use client"

import { useBlogContext } from "@/hooks/context-hooks"
import { AddPostForm } from "../forms/post-forms"
import { PageHeader } from "../page-header"
import { PageWrapper } from "./page-wrapper"

export function NewPostPageComponent() {
    const { localization } = useBlogContext()
    return (
        <PageWrapper className="gap-6" testId="new-post-page">
            <PageHeader
                title={localization.BLOG_POST_ADD_TITLE}
                description={localization.BLOG_POST_ADD_DESCRIPTION}
            />
            <AddPostForm onClose={() => {}} onSuccess={() => {}} />
        </PageWrapper>
    )
}
