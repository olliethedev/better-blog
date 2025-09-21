import { PostsLoading } from "@/router/loading-resolver"
import type { Post } from "@/types"
import type { BlogDataProvider } from "@/types"
import type { RouteMatch } from "@/types"
import type { QueryClient } from "@tanstack/react-query"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { Suspense } from "react"
import { BlogPageRouter } from "../../components/better-blog/blog-router-page"
import { matchRoute } from "../../router"
import { prefetchBlogData } from "./prefetch"
import type { BlogPageMetadata, BlogPostMetadata } from "./types"

import { resolveLoadingComponent } from "@/router/loading-resolver"
import { routeSchema } from "@/router/routes"
import type { BlogServerAdapter, CreateBlogServerAdapterOptions } from "./types"

/**
 * Create a server adapter to integrate Better Blog with SSR/SSG frameworks.
 *
 * It provides helpers to generate static params, produce metadata, and a server
 * entry that prefetches data and hydrates state for the client.
 *
 * @param options.provider Data provider used on the server to read blog data
 * @param options.queryClient React Query client instance for prefetching and dehydrating
 * @returns A {@link BlogServerAdapter}
 */
export function createBlogServerAdapter(
    options: CreateBlogServerAdapterOptions
): BlogServerAdapter {
    const { provider: serverConfig, queryClient } = options
    return {
        generateStaticParams() {
            const staticRoutes = generateStaticRoutes()
            return staticRoutes.map((route) => ({ all: route.slug }))
        },

        async generateMetadata(path?: string): Promise<BlogPageMetadata> {
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
                        return buildPageMetadata(generatePostMetadata(post))
                    }
                } catch (error) {
                    console.error("Error fetching post metadata:", error)
                    // Fall back to route-based metadata
                }
            }

            // Use fallback metadata from route match
            return buildPageMetadata({
                title: match.metadata.title,
                description: match.metadata.description,
                image: match.metadata.image
            })
        },

        BlogServerRouter: async function BlogServerRouter({
            path,
            loadingComponentOverrides
        }) {
            const routeMatch = matchRoute(path?.split("/").filter(Boolean))
            const LoadingComponent = resolveLoadingComponent(
                routeMatch.type,
                loadingComponentOverrides
            )

            const fallbackComponent = LoadingComponent ? (
                <LoadingComponent />
            ) : (
                <PostsLoading />
            )

            return (
                <Suspense fallback={fallbackComponent}>
                    <BlogServerRouterContent
                        routeMatch={routeMatch}
                        path={path}
                        serverConfig={serverConfig}
                        queryClient={queryClient}
                    />
                </Suspense>
            )
        },

        prefetch: async function prefetch({ path }) {
            const routeMatch = matchRoute(path?.split("/").filter(Boolean))
            await prefetchBlogData({
                match: routeMatch,
                provider: serverConfig,
                queryClient
            })
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
    await prefetchBlogData({
        match: routeMatch,
        provider: serverConfig,
        queryClient
    })

    // Dehydrate the state for hydration on the client
    const dehydratedState = dehydrate(queryClient)

    return (
        <HydrationBoundary state={dehydratedState}>
            <BlogPageRouter path={path} />
        </HydrationBoundary>
    )
}

function generatePostMetadata(post: Post): BlogPostMetadata {
    return {
        title: post.title,
        description: post.excerpt,
        image: post.image
    }
}

function buildPageMetadata(meta: BlogPostMetadata): BlogPageMetadata {
    const { title, description, image } = meta
    const images = image ? [image] : undefined
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: images
        },
        twitter: {
            card: image ? "summary_large_image" : "summary",
            title,
            description,
            images
        }
    }
}

function generateStaticRoutes(): Array<{ slug: string[] }> {
    const staticRoutes: Array<{ slug: string[] }> = []

    // Collect static routes from all route definitions
    for (const routeDef of routeSchema.routes) {
        if (routeDef.staticRoutes) {
            staticRoutes.push(...routeDef.staticRoutes)
        }
    }

    return staticRoutes
}
