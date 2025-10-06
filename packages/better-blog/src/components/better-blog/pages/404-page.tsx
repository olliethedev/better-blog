"use client"

import { useBlogContext } from "@/hooks/context-hooks"
import { ErrorPlaceholder } from "../error-placeholder"

// Not Found route placeholder using localized strings
export function NotFoundPage({ message }: { message: string }) {
    const { localization } = useBlogContext()
    const title = localization.BLOG_PAGE_NOT_FOUND_TITLE
    const desc = message || localization.BLOG_PAGE_NOT_FOUND_DESCRIPTION
    return <ErrorPlaceholder title={title} message={desc} />
}
