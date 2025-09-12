"use client";

import { useBlogContext } from "../../../lib/better-blog/context/better-blog-context"
import { AddPostForm } from "../forms/post-forms"
import { PageHeader } from "../page-header"
import { PageWrapper } from "./page-wrapper"

export function NewPostPageComponent() {
    const { localization } = useBlogContext()
    return (
        <PageWrapper className="gap-6">
            <PageHeader
                title={localization.BLOG_POST_ADD_TITLE}
                description={localization.BLOG_POST_ADD_DESCRIPTION}
            />
            <AddPostForm onClose={() => {}} onSuccess={() => {}} />
        </PageWrapper>
    )
}


