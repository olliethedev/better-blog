"use client"

import { ErrorPlaceholder } from "@/components/better-blog/error-placeholder"
import { BlogContext } from "@/context/better-blog-context"
import { useBlogContext } from "@/hooks/context-hooks"
import { usePageOverrides } from "@/hooks/context-hooks"
import type { RouteMatch } from "@/types"
import React, { Suspense } from "react"
import { RouteProvider } from "../../context/route-context"

import { matchRoute } from "../../router/router"

import { resolveErrorComponent } from "@/router/error-resolver"
import { resolveLoadingComponent } from "@/router/loading-resolver"
import { resolvePageComponent } from "@/router/page-resolver"

// Not Found route placeholder using localized strings
function NotFoundPage({ message }: { message: string }) {
    const { localization } = useBlogContext()
    const title = localization.BLOG_PAGE_NOT_FOUND_TITLE
    const desc = message || localization.BLOG_PAGE_NOT_FOUND_DESCRIPTION
    return <ErrorPlaceholder title={title} message={desc} />
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
    static contextType = BlogContext
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
            const ctx = this.context as ReturnType<typeof useBlogContext> | null
            const title =
                ctx?.localization?.BLOG_GENERIC_ERROR_TITLE ??
                "Something went wrong"
            const desc =
                this.state.error.message ||
                ctx?.localization?.BLOG_GENERIC_ERROR_MESSAGE ||
                "An unexpected error occurred."
            return <ErrorPlaceholder title={title} message={desc} />
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
        <div data-testid="blog-page-root">
            <RouteProvider routeMatch={routeMatch}>
                <BlogPageRouterContent
                    routeMatch={routeMatch}
                    NotFoundComponent={NotFoundComponent}
                />
            </RouteProvider>
        </div>
    )
}
