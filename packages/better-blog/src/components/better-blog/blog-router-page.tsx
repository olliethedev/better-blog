"use client"

import { DefaultError } from "@/components/better-blog/default-error"
import { ErrorPlaceholder } from "@/components/better-blog/error-placeholder"
import { ListPageSkeleton } from "@/components/better-blog/list-page-skeleton"
import { BlogContext } from "@/context/better-blog-context"
import { useBlogContext } from "@/hooks/context-hooks"
import type { RouteMatch } from "@/types"
import React, { Suspense } from "react"
import { RouteProvider } from "../../context/route-context"
import {
    blogRouterClient,
    matchRouteClient
} from "../../router/blog-router-client"

// Default loading component
function PostsLoading() {
    return (
        <div data-testid="posts-skeleton">
            <ListPageSkeleton />
        </div>
    )
}

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
    NotFoundComponent = NotFoundPage,
    path
}: {
    routeMatch: RouteMatch
    NotFoundComponent?: React.ComponentType<{ message: string }>
    path: string
}) {
    // Use yar router to get the route with all components
    const route = blogRouterClient.getRoute(path)

    if (route) {
        // Get components from the route, with simple fallbacks
        const PageComponent = route.PageComponent
        const ErrorComponent = route.ErrorComponent || DefaultError
        const LoadingComponent = route.LoadingComponent || PostsLoading

        if (PageComponent) {
            const fallback = LoadingComponent ? <LoadingComponent /> : null
            return (
                <Suspense fallback={fallback}>
                    <RouteErrorBoundary ErrorComponent={ErrorComponent}>
                        <PageComponent />
                    </RouteErrorBoundary>
                </Suspense>
            )
        }
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

// Main component that handles routing using yar
export function BlogPageRouter({
    path
}: {
    path?: string
}) {
    const { basePath } = useBlogContext()
    const pathSegments = path?.split("/").filter(Boolean) || []

    // Strip basePath if present
    let normalizedPath = pathSegments
    if (
        basePath &&
        pathSegments[0] === basePath.split("/").filter(Boolean)[0]
    ) {
        normalizedPath = pathSegments.slice(1)
    }

    const fullPath = normalizedPath.length
        ? `/${normalizedPath.join("/")}`
        : "/"
    const routeMatch = matchRouteClient(pathSegments, basePath)

    return (
        <div data-testid="blog-page-root">
            <RouteProvider routeMatch={routeMatch}>
                <BlogPageRouterContent
                    routeMatch={routeMatch}
                    path={fullPath}
                />
            </RouteProvider>
        </div>
    )
}
