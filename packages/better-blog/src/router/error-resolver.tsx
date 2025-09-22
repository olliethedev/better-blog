// This file is intentionally kept separate from client components to ensure
// it can be used on both server and client in environments like Next.js

import { ErrorPlaceholder } from "@/components/better-blog/error-placeholder"
import { useBlogContext } from "@/hooks/context-hooks"
import type { PageComponentOverrides, RouteMatch } from "@/types"

function DefaultError({ message }: { message?: string }) {
    // Pull localized strings
    const { localization } = useBlogContext()
    const title = localization.BLOG_LIST_ERROR_TITLE
    const desc = message ?? localization.BLOG_LIST_ERROR
    return <ErrorPlaceholder title={title} message={desc} />
}

// Default error components per route
const defaultErrorComponents: Record<
    RouteMatch["type"],
    React.ComponentType<{ message?: string }>
> = {
    home: DefaultError,
    post: DefaultError,
    tag: DefaultError,
    drafts: DefaultError,
    new: DefaultError,
    edit: DefaultError,
    unknown: DefaultError
} as const

/**
 * Resolves the final error component for a route type, applying overrides.
 * Server-safe: does not import client-only modules.
 */
export function resolveErrorComponent(
    routeType: RouteMatch["type"],
    overrides?: PageComponentOverrides
): React.ComponentType<{ message?: string }> | undefined {
    if (routeType === "unknown" || !(routeType in defaultErrorComponents)) {
        return undefined
    }

    const type = routeType

    if (overrides) {
        switch (type) {
            case "home":
                return (
                    overrides.HomeErrorComponent || defaultErrorComponents.home
                )
            case "post":
                return (
                    overrides.PostErrorComponent || defaultErrorComponents.post
                )
            case "tag":
                return overrides.TagErrorComponent || defaultErrorComponents.tag
            case "drafts":
                return (
                    overrides.DraftsErrorComponent ||
                    defaultErrorComponents.drafts
                )
            case "new":
                return (
                    overrides.NewPostErrorComponent ||
                    defaultErrorComponents.new
                )
            case "edit":
                return (
                    overrides.EditPostErrorComponent ||
                    defaultErrorComponents.edit
                )
        }
    }

    return defaultErrorComponents[type]
}

export { DefaultError }
