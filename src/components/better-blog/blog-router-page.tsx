"use client";

import type { PageComponentOverrides } from "@/types"
import type { RouteMatch } from "@/types"
import {
    useBlogContext,
    usePageOverrides
} from "../../context/better-blog-context"
import { RouteProvider } from "../../context/route-context"

import { matchRoute } from "../../router/router"

import { resolveLoadingComponent } from "@/router/loading-resolver"
import {
    DraftsPageComponent,
    EditPostPageComponent,
    HomePageComponent,
    NewPostPageComponent,
    PostPageComponent,
    TagPageComponent
} from "./pages"

function NotFoundPage({ message }: { message: string }) {
    return (
        <div>
            <h1>Not Found</h1>
            <p>{message}</p>
        </div>
    )
}

// Internal component that renders based on routeMatch
function BlogPageRouterContent({
    routeMatch,
    NotFoundComponent = NotFoundPage
}: {
    routeMatch: RouteMatch
    NotFoundComponent?: React.ComponentType<{ message: string }>
}) {
    // Components get route data via useRoute hook - no prop drilling needed!
    // Get page overrides from context
    const pageOverrides = usePageOverrides()

    // Resolve the component from the client-side component mappings with overrides
    const Component = resolveRouteComponent(routeMatch, pageOverrides)

    if (Component) {
        return <Component />
    }

    // Fallback for unknown routes
    return <NotFoundComponent message={routeMatch.metadata.title} />
}

// Main component that takes slug and handles routing + context internally
export function BlogPageRouter({
    path
}: {
    path?: string
}) {
    const { basePath } = useBlogContext()
    const routeMatch = matchRoute(path?.split("/").filter(Boolean), basePath)

    // Get page overrides from context to extract NotFoundComponent
    const pageOverrides = usePageOverrides()
    const NotFoundComponent = pageOverrides?.NotFoundComponent

    return (
        <RouteProvider routeMatch={routeMatch}>
            <BlogPageRouterContent
                routeMatch={routeMatch}
                NotFoundComponent={NotFoundComponent}
            />
        </RouteProvider>
    )
}

/**
 * Resolves the component and loading component for a given route match
 * This keeps RouteMatch pure while using client-side component mappings
 */
function resolveRouteComponents(
    routeMatch: RouteMatch,
    overrides?: PageComponentOverrides
): {
    Component?: React.ComponentType
    LoadingComponent?: React.ComponentType
} {
    return {
        Component: resolveComponent(routeMatch.type, overrides),
        LoadingComponent: resolveLoadingComponent(routeMatch.type, overrides)
    }
}

/**
 * Gets just the component for a route match (convenience function)
 */
export function resolveRouteComponent(
    routeMatch: RouteMatch,
    overrides?: PageComponentOverrides
): React.ComponentType | undefined {
    const { Component } = resolveRouteComponents(routeMatch, overrides)
    return Component
}

// Default component mappings (excluding 'unknown' type)
export const defaultComponents = {
    home: HomePageComponent,
    post: PostPageComponent,
    tag: TagPageComponent,
    drafts: DraftsPageComponent,
    new: NewPostPageComponent,
    edit: EditPostPageComponent
} as const

/**
 * Resolves the final component for a route type, applying overrides
 */
export function resolveComponent(
    routeType: RouteMatch["type"],
    overrides?: PageComponentOverrides
): React.ComponentType | undefined {
    // Handle unknown route types early
    if (routeType === "unknown" || !(routeType in defaultComponents)) {
        return undefined
    }

    const type = routeType

    // Check for override first
    if (overrides) {
        switch (type) {
            case "home":
                return overrides.HomeComponent || defaultComponents.home
            case "post":
                return overrides.PostComponent || defaultComponents.post
            case "tag":
                return overrides.TagComponent || defaultComponents.tag
            case "drafts":
                return overrides.DraftsComponent || defaultComponents.drafts
            case "new":
                return overrides.NewPostComponent || defaultComponents.new
            case "edit":
                return overrides.EditPostComponent || defaultComponents.edit
        }
    }

    // Fall back to default
    return defaultComponents[type]
}


