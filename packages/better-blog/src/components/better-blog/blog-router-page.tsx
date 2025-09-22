"use client"

import { useBlogContext } from "@/hooks/context-hooks"
import { usePageOverrides } from "@/hooks/context-hooks"
import type { RouteMatch } from "@/types"
import React, { Suspense } from "react"
import { RouteProvider } from "../../context/route-context"

import { matchRoute } from "../../router/router"

import { resolveErrorComponent } from "@/router/error-resolver"
import { resolveLoadingComponent } from "@/router/loading-resolver"
import { resolvePageComponent } from "@/router/page-resolver"

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
    const Component = resolvePageComponent(routeMatch.type, pageOverrides)
    const ErrorComponent = resolveErrorComponent(routeMatch.type, pageOverrides)
    const LoadingComponent = resolveLoadingComponent(
        routeMatch.type,
        pageOverrides
    )

    if (Component) {
        const fallback = LoadingComponent ? <LoadingComponent /> : null
        return (
            <Suspense fallback={fallback}>
                <RouteErrorBoundary ErrorComponent={ErrorComponent}>
                    <Component />
                </RouteErrorBoundary>
            </Suspense>
        )
    }

    // Fallback for unknown routes
    return <NotFoundComponent message={routeMatch.metadata.title} />
}

class RouteErrorBoundary extends React.Component<
    {
        ErrorComponent?: React.ComponentType<{ message?: string }>
        children: React.ReactNode
    },
    { error?: Error }
> {
    state: { error?: Error } = {}
    static getDerivedStateFromError(error: Error) {
        return { error }
    }
    componentDidCatch() {}
    render() {
        const { ErrorComponent, children } = this.props
        if (this.state.error) {
            if (ErrorComponent) {
                return <ErrorComponent message={this.state.error.message} />
            }
            return (
                <div role="alert">
                    <h2>Something went wrong</h2>
                    <p>{this.state.error.message}</p>
                </div>
            )
        }
        return children as React.ReactElement
    }
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
