import { resolveMetadata, resolveSEO } from "@/router/meta-resolver"
import type {
    BlogDataProvider,
    BlogPageMetadata,
    RouteMatch,
    SeoSiteConfig
} from "@/types"
import type { QueryClient } from "@tanstack/react-query"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { BlogPageRouter } from "../../components/better-blog/blog-router-page"
import { matchRoute } from "../../router"
import { prefetchBlogData } from "./prefetch"
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
    const { provider: serverConfig, queryClient, site } = options
    return {
        generateStaticParams() {
            const staticRoutes = generateStaticRoutes()
            return staticRoutes.map((route) => ({ all: route.slug }))
        },

        async generateMetadata(path?: string): Promise<BlogPageMetadata> {
            const match = matchRoute(path?.split("/").filter(Boolean))
            return resolveMetadata(match, serverConfig, site)
        },
        async generateNextMetadata(
            path?: string
        ): Promise<Record<string, unknown>> {
            const match = matchRoute(path?.split("/").filter(Boolean))
            const seo = await resolveSEO(match, serverConfig, site)
            return mapSeoToNextMetadata(seo)
        },

        BlogServerRouter: async function BlogServerRouter({ path }) {
            const routeMatch = matchRoute(path?.split("/").filter(Boolean))
            return (
                <BlogServerRouterContent
                    routeMatch={routeMatch}
                    path={path}
                    serverConfig={serverConfig}
                    queryClient={queryClient}
                    site={site}
                />
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
    queryClient,
    site
}: {
    path?: string
    routeMatch: RouteMatch
    serverConfig: BlogDataProvider
    queryClient: QueryClient
    site?: SeoSiteConfig
}) {
    // Prefetch data on the server
    await prefetchBlogData({
        match: routeMatch,
        provider: serverConfig,
        queryClient
    })

    // Dehydrate the state for hydration on the client
    const dehydratedState = dehydrate(queryClient)

    // Build SEO (metadata + JSON-LD) on the server so frameworks can consume
    const seo = await resolveSEO(routeMatch, serverConfig, site)

    return (
        <HydrationBoundary state={dehydratedState}>
            {/* Embed JSON-LD on the server for crawlers without JS */}
            {seo.structuredData.map((obj, idx) => (
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
    // These are the routes that don't require dynamic parameters
    const staticRoutes: Array<{ slug: string[] }> = [
        { slug: [] }, // home route
        { slug: ["new"] }, // new post route
        { slug: ["drafts"] } // drafts route
    ]

    return staticRoutes
}
