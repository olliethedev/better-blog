import type { QueryClient } from "@tanstack/react-query"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import React from "react"
import { BlogPageRouter } from "../../../components/better-blog/blog-router-page"
import { PostsLoading } from "../../../components/better-blog/loading"
import type { PageComponentOverrides } from "../core/client-components"
import { generateStaticRoutes, matchRoute } from "../core/router"
import { resolveServerLoadingComponent } from "../core/server-components"
import type { BlogDataProvider, RouteMatch } from "../core/types"
import { generatePostMetadata } from "../core/utils"
import { prefetchBlogData } from "./prefetch"

/**
 * The server adapter returned by {@link createBlogServerAdapter} for SSR/SSG frameworks.
 */
export interface BlogServerAdapter {
    /**
     * Return the list of all dynamic route params for static generation.
     * Useful for frameworks like Next.js `generateStaticParams`.
     */
    generateStaticParams: () => Array<{ all: string[] }>
    /**
     * Generate page metadata for the given path. Will attempt to fetch post data
     * for post routes to produce rich metadata, and otherwise falls back to
     * route-based defaults.
     */
    generateMetadata: (
        path?: string
    ) => Promise<{ title: string; description?: string }>
    /**
     * Server entry component that prefetches data and renders the routed page
     * within a React Query hydration boundary.
     */
    BlogServerRouter: React.ComponentType<{
        /** Optional path string like "posts/my-post" (no leading slash). */
        path?: string
        /** React Query client instance used for prefetch/dehydrate. */
        queryClient: QueryClient
        /**
         * Optional overrides for server-side loading components rendered while
         * the page is being prepared.
         */
        loadingComponentOverrides?: Pick<
            PageComponentOverrides,
            | "HomeLoadingComponent"
            | "PostLoadingComponent"
            | "TagLoadingComponent"
            | "DraftsLoadingComponent"
            | "NewPostLoadingComponent"
            | "EditPostLoadingComponent"
        >
    }>
}

/**
 * Create a server adapter to integrate Better Blog with SSR/SSG frameworks.
 *
 * It provides helpers to generate static params, produce metadata, and a server
 * entry that prefetches data and hydrates state for the client.
 *
 * @param serverConfig Data provider used on the server to read blog data
 * @param queryClient React Query client instance for prefetching and dehydrating
 * @returns A {@link BlogServerAdapter}
 */
export function createBlogServerAdapter(
    serverConfig: BlogDataProvider,
    queryClient: QueryClient
): BlogServerAdapter {
    return {
        generateStaticParams() {
            const staticRoutes = generateStaticRoutes()
            return staticRoutes.map((route) => ({ all: route.slug }))
        },

        async generateMetadata(path?: string) {
            const match = matchRoute(path?.split("/").filter(Boolean))

            // For post routes, fetch the actual post data to generate dynamic metadata
            if (match.type === "post" && match.params?.slug) {
                try {
                    const slug = match.params.slug
                    const post =
                        (await serverConfig.getPostBySlug?.(slug)) ??
                        (await serverConfig.getAllPosts({ slug })).find(
                            (p) => p.slug === slug
                        )

                    if (post) {
                        return generatePostMetadata(post)
                    }
                } catch (error) {
                    console.error("Error fetching post metadata:", error)
                    // Fall back to route-based metadata
                }
            }

            // Use fallback metadata from route match
            return {
                title: match.metadata.title,
                description: match.metadata.description,
                image: match.metadata.image
            }
        },

        BlogServerRouter: async function BlogServerRouter({
            path,
            loadingComponentOverrides
        }) {
            const routeMatch = matchRoute(path?.split("/").filter(Boolean))
            const LoadingComponent = resolveServerLoadingComponent(
                routeMatch.type,
                loadingComponentOverrides
            )

            const fallbackComponent = LoadingComponent ? (
                <LoadingComponent />
            ) : (
                <PostsLoading />
            )

            return (
                <React.Suspense fallback={fallbackComponent}>
                    <BlogServerRouterContent
                        routeMatch={routeMatch}
                        path={path}
                        serverConfig={serverConfig}
                        queryClient={queryClient}
                    />
                </React.Suspense>
            )
        }
    }
}

async function BlogServerRouterContent({
    path,
    routeMatch,
    serverConfig,
    queryClient
}: {
    path?: string
    routeMatch: RouteMatch
    serverConfig: BlogDataProvider
    queryClient: QueryClient
}) {
    // Prefetch data on the server
    await prefetchBlogData(routeMatch, serverConfig, queryClient)

    // Dehydrate the state for hydration on the client
    const dehydratedState = dehydrate(queryClient)

    return (
        <HydrationBoundary state={dehydratedState}>
            <BlogPageRouter path={path} />
        </HydrationBoundary>
    )
}
