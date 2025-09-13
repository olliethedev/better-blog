"use client";

import {
    useBlogContext,
    usePageOverrides
} from "../../context/better-blog-context"
import { RouteProvider } from "../../context/route-context"
import { resolveRouteComponent } from "../../core/component-resolver"
import { matchRoute } from "../../core/router"
import type { RouteMatch } from "../../core/types"

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

