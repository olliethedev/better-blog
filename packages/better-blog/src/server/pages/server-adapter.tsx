import type {
    BlogDataProvider,
    BlogPageMetadata,
    BlogPageSEO,
    RouteInfo,
    SeoSiteConfig
} from "@/types"
import type { QueryClient } from "@tanstack/react-query"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { BlogPageRouter } from "../../components/better-blog/blog-router-page"
import { blogRouter, getRouteInfo, prefetchRoute } from "../../router"
import type { BlogServerAdapter, CreateBlogServerAdapterOptions } from "./types"

/**
 * Convert JSX meta elements to BlogPageMetadata structure
 */
function metaElementsToMetadata(
    metaElements: Array<React.JSX.IntrinsicElements["meta"] | undefined>
): BlogPageMetadata {
    const metadata: BlogPageMetadata = { title: "" }

    for (const meta of metaElements) {
        if (!meta) continue

        if ("name" in meta && meta.name === "title" && "content" in meta) {
            metadata.title = meta.content as string
        } else if (
            "name" in meta &&
            meta.name === "description" &&
            "content" in meta
        ) {
            metadata.description = meta.content as string
        } else if (
            "name" in meta &&
            meta.name === "robots" &&
            "content" in meta
        ) {
            metadata.robots = meta.content as string
        } else if ("property" in meta && "content" in meta) {
            // Open Graph tags
            if (!metadata.openGraph) metadata.openGraph = {}

            const prop = meta.property as string
            const content = meta.content as string

            if (prop === "og:type") metadata.openGraph.type = content
            else if (prop === "og:title") metadata.openGraph.title = content
            else if (prop === "og:description")
                metadata.openGraph.description = content
            else if (prop === "og:url") {
                metadata.openGraph.url = content
                // Also use og:url as canonical URL
                metadata.canonicalUrl = content
            } else if (prop === "og:site_name")
                metadata.openGraph.siteName = content
            else if (prop === "og:image") {
                if (!metadata.openGraph.images) metadata.openGraph.images = []
                metadata.openGraph.images.push(content)
            }
        } else if ("name" in meta && "content" in meta) {
            // Twitter tags
            const name = meta.name as string
            const content = meta.content as string

            if (name.startsWith("twitter:")) {
                if (!metadata.twitter) metadata.twitter = {}

                if (
                    name === "twitter:card" &&
                    (content === "summary" || content === "summary_large_image")
                ) {
                    metadata.twitter.card = content
                } else if (name === "twitter:title") {
                    metadata.twitter.title = content
                } else if (name === "twitter:description") {
                    metadata.twitter.description = content
                } else if (name === "twitter:image") {
                    if (!metadata.twitter.images) metadata.twitter.images = []
                    metadata.twitter.images.push(content)
                }
            }
        }
    }

    return metadata
}

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
    const { provider: serverConfig, queryClient, site } = options
    return {
        generateStaticParams() {
            const staticRoutes = generateStaticRoutes()
            return staticRoutes.map((route) => ({ all: route.slug }))
        },

        async generateMetadata(path?: string): Promise<BlogPageMetadata> {
            const pathSegments = path?.split("/").filter(Boolean) || []
            const routePath = pathSegments.length
                ? `/${pathSegments.join("/")}`
                : "/"
            const route = blogRouter.getRoute(routePath)
            const routeInfo = getRouteInfo(routePath)

            if (route?.meta && typeof route.meta === "function") {
                const metaElements = await route.meta(
                    routeInfo,
                    serverConfig,
                    site
                )
                return metaElementsToMetadata(metaElements)
            }

            // Fallback for unknown routes
            return {
                title: "Not Found"
            }
        },
        async generateNextMetadata(
            path?: string
        ): Promise<Record<string, unknown>> {
            const pathSegments = path?.split("/").filter(Boolean) || []
            const routePath = pathSegments.length
                ? `/${pathSegments.join("/")}`
                : "/"
            const route = blogRouter.getRoute(routePath)
            const routeInfo = getRouteInfo(routePath)

            // Get metadata from route's meta field
            let metadata: BlogPageMetadata = {
                title: "Not Found"
            }

            if (route?.meta && typeof route.meta === "function") {
                const metaElements = await route.meta(
                    routeInfo,
                    serverConfig,
                    site
                )
                metadata = metaElementsToMetadata(metaElements)
            }

            // Get structured data from route's seo function in extra
            let structuredData: Array<Record<string, unknown>> = []
            if (route?.extra && typeof route.extra === "function") {
                const extra = route.extra()
                if (
                    extra &&
                    "seo" in extra &&
                    typeof extra.seo === "function"
                ) {
                    const seo = await extra.seo(routeInfo, serverConfig, site)
                    structuredData = seo.structuredData
                }
            }

            return mapSeoToNextMetadata({ meta: metadata, structuredData })
        },

        BlogServerRouter: async function BlogServerRouter({ path }) {
            const pathSegments = path?.split("/").filter(Boolean) || []
            const routePath = pathSegments.length
                ? `/${pathSegments.join("/")}`
                : "/"
            const route = blogRouter.getRoute(routePath)
            const routeInfo = getRouteInfo(routePath)

            return (
                <BlogServerRouterContent
                    routeInfo={routeInfo}
                    route={route}
                    path={path}
                    serverConfig={serverConfig}
                    queryClient={queryClient}
                    site={site}
                />
            )
        }
    }
}

async function BlogServerRouterContent({
    path,
    routeInfo,
    route,
    serverConfig,
    queryClient,
    site
}: {
    path?: string
    routeInfo: RouteInfo
    route: ReturnType<typeof blogRouter.getRoute>
    serverConfig: BlogDataProvider
    queryClient: QueryClient
    site?: SeoSiteConfig
}) {
    // Prefetch data on the server using the route's loader
    const pathSegments = path?.split("/").filter(Boolean) || []
    const routePath = pathSegments.length ? `/${pathSegments.join("/")}` : "/"
    await prefetchRoute(routePath, serverConfig, queryClient)

    // Dehydrate the state for hydration on the client
    const dehydratedState = dehydrate(queryClient)

    // Build SEO (metadata + JSON-LD) on the server so frameworks can consume

    let seo: BlogPageSEO | undefined
    if (route?.extra && typeof route.extra === "function") {
        const extra = route.extra()
        if (extra && "seo" in extra && typeof extra.seo === "function") {
            seo = await extra.seo(routeInfo, serverConfig, site)
        }
    }

    return (
        <HydrationBoundary state={dehydratedState}>
            {/* Embed JSON-LD on the server for crawlers without JS */}
            {seo?.structuredData.map((obj, idx) => (
                <script key={idx} type="application/ld+json">
                    {JSON.stringify(obj)}
                </script>
            ))}
            <BlogPageRouter path={path} />
        </HydrationBoundary>
    )
}

function mapSeoToNextMetadata(
    seo: import("@/types").BlogPageSEO
): Record<string, unknown> {
    const md: Record<string, unknown> = {
        title: seo.meta.title,
        description: seo.meta.description,
        robots: seo.meta.robots,
        alternates: seo.meta.canonicalUrl
            ? { canonical: seo.meta.canonicalUrl }
            : undefined,
        openGraph: seo.meta.openGraph && {
            title: seo.meta.openGraph.title ?? seo.meta.title,
            description: seo.meta.openGraph.description ?? seo.meta.description,
            url: seo.meta.openGraph.url,
            type: seo.meta.openGraph.type,
            siteName: seo.meta.openGraph.siteName,
            images: (seo.meta.openGraph.images ?? []).map((img) =>
                typeof img === "string" ? { url: img } : img
            )
        },
        twitter: seo.meta.twitter && {
            card: seo.meta.twitter.card,
            title: seo.meta.twitter.title ?? seo.meta.title,
            description: seo.meta.twitter.description ?? seo.meta.description,
            images: seo.meta.twitter.images
        },
        other: {
            // Provide JSON-LD for easy consumption in Next app router
            __betterBlogJsonLd: seo.structuredData
        }
    }
    return md
}

function generateStaticRoutes(): Array<{ slug: string[] }> {
    // Static routes for SSG generation
    // Filter route definitions that have isStatic in their meta configuration
    const staticRoutes: Array<{ slug: string[] }> = []

    for (const routeDef of Object.values(blogRouter.routes)) {
        // Check if route-level meta has isStatic property
        if (
            routeDef.meta &&
            "isStatic" in routeDef.meta &&
            routeDef.meta.isStatic
        ) {
            // Extract the path from the route definition
            const path = routeDef.path
            staticRoutes.push({
                slug: path === "/" ? [] : path.split("/").filter(Boolean)
            })
        }
    }

    return staticRoutes
}
