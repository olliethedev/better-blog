"use client"
import { useBlogContext } from "@/hooks/context-hooks"
import { ErrorPlaceholder } from "./error-placeholder"


// Default error component
export function DefaultError({ message }: { message?: string }) {
    const { localization } = useBlogContext()
    const title = localization.BLOG_LIST_ERROR_TITLE
    const desc = message ?? localization.BLOG_LIST_ERROR
    return <ErrorPlaceholder title={title} message={desc} />
}