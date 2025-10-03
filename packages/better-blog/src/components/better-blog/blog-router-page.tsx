import { DefaultError } from "@/components/better-blog/default-error"
import { ErrorPlaceholder } from "@/components/better-blog/error-placeholder"
import { ListPageSkeleton } from "@/components/better-blog/list-page-skeleton"
import { BlogContext } from "@/context/better-blog-context"
import { RouteProvider } from "@/context/route-context"
import type { useBlogContext } from "@/hooks/context-hooks"
import React, { Suspense } from "react"
import { blogClientRouter } from "../../router/blog-client-router"
import { NotFoundPage } from "./pages/404-page"

// Default loading component
function PostsLoading() {
    return (
        <div data-testid="posts-skeleton">
            <ListPageSkeleton />
        </div>
    )
}

// Internal component that renders based on route
function BlogPageRouterContent({
    route,
    NotFoundComponent = NotFoundPage,
    path
}: {
    route: ReturnType<typeof blogClientRouter.getRoute>
    NotFoundComponent?: React.ComponentType<{ message: string }>
    path: string
}) {
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
    return <NotFoundComponent message={`Unknown route: ${path}`} />
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
    path,
    basePath
}: {
    path?: string
    basePath?: string
}) {
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

    // Use yar router directly to get the route
    const route = blogClientRouter.getRoute(fullPath)

    // Extract type from extra and params from route
    const type = route?.extra?.()?.type || "unknown"
    const params = route?.params

    return (
        <div data-testid="blog-page-root">
            <RouteProvider type={type} params={params}>
                <BlogPageRouterContent route={route} path={fullPath} />
            </RouteProvider>
        </div>
    )
}
