// Server-side component resolution utilities
// This mirrors client-components.ts but for server-side usage

import type React from "react"
import { defaultLoadingComponents} from '../components/better-blog/loading';
import type { PageComponentOverrides } from "./client-components"
import type { RouteMatch } from './types';


/**
 * Resolves the server-side loading component for a route type, applying overrides
 * This is used during server-side Suspense fallbacks during prefetch
 */
export function resolveServerLoadingComponent(
    routeType: RouteMatch["type"],
    overrides?: PageComponentOverrides
): React.ComponentType | undefined {
    // Handle unknown route types early
    if (routeType === "unknown" || !(routeType in defaultLoadingComponents)) {
        return undefined
    }

    const type = routeType

    // Check for override first - reuse the same override props as client
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

    // Fall back to default loading component
    return defaultLoadingComponents[type]
}