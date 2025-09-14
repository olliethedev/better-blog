// This file is intentionally kept separate from client components to ensure
// it can be used on both server and client in Next.js environments

import type { PageComponentOverrides, RouteMatch } from "@/types"
import { FormPageSkeleton } from "../components/better-blog/form-page-skeleton"
import { ListPageSkeleton } from "../components/better-blog/list-page-skeleton"
import { PostPageSkeleton } from "../components/better-blog/post-page-skeleton"

// Define loading components using the skeleton components directly
// This avoids importing from a file that might have client dependencies
function FormLoading() {
    return (
        <div data-testid="form-skeleton">
            <FormPageSkeleton />
        </div>
    )
}

function PostsLoading() {
    return (
        <div data-testid="posts-skeleton">
            <ListPageSkeleton />
        </div>
    )
}

function PostLoading() {
    return (
        <div data-testid="post-skeleton">
            <PostPageSkeleton />
        </div>
    )
}

// Create the default loading components map
const defaultLoadingComponents: Record<
    RouteMatch["type"],
    React.ComponentType
> = {
    home: PostsLoading,
    post: PostLoading,
    tag: PostsLoading,
    drafts: PostsLoading,
    new: FormLoading,
    edit: FormLoading,
    unknown: PostLoading
} as const

/**
 * Resolves the final loading component for a route type, applying overrides
 * This function is designed to work on both server and client
 */
export function resolveLoadingComponent(
    routeType: RouteMatch["type"],
    overrides?: PageComponentOverrides
): React.ComponentType | undefined {
    // Handle unknown route types early
    if (routeType === "unknown" || !(routeType in defaultLoadingComponents)) {
        return undefined
    }

    const type = routeType

    // Check for override first
    if (overrides) {
        switch (type) {
            case "home":
                return (
                    overrides.HomeLoadingComponent ||
                    defaultLoadingComponents.home
                )
            case "post":
                return (
                    overrides.PostLoadingComponent ||
                    defaultLoadingComponents.post
                )
            case "tag":
                return (
                    overrides.TagLoadingComponent ||
                    defaultLoadingComponents.tag
                )
            case "drafts":
                return (
                    overrides.DraftsLoadingComponent ||
                    defaultLoadingComponents.drafts
                )
            case "new":
                return (
                    overrides.NewPostLoadingComponent ||
                    defaultLoadingComponents.new
                )
            case "edit":
                return (
                    overrides.EditPostLoadingComponent ||
                    defaultLoadingComponents.edit
                )
        }
    }

    // Fall back to default
    return defaultLoadingComponents[type]
}

// Export the loading components for backward compatibility
export { FormLoading, PostsLoading, PostLoading }
