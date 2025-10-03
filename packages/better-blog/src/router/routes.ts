// Server-safe route definitions (no component imports)
// This file can be imported in both server and client contexts
import type {
    BlogDataProvider,
    BlogPageSEO,
    RouteInfo,
    RouteType,
    SeoSiteConfig
} from "@/types"
import { createRoute } from "@olliethedev/yar"
import type { QueryClient } from "@tanstack/react-query"
import { createBlogQueryKeys } from "../queries"
import { resolveSEO } from "./meta-resolver"

/**
 * SEO resolver type for routes
 */
export type SEOResolver = (
    routeInfo: RouteInfo,
    serverConfig: BlogDataProvider,
    site?: SeoSiteConfig
) => Promise<BlogPageSEO>

/**
 * Extended route extra with SEO resolver
 */
export interface RouteExtraWithMeta {
    type: RouteType
    seo: SEOResolver
}

/**
 * Helper to convert BlogPageSEO to JSX meta elements
 */
function seoToMetaElements(
    seo: BlogPageSEO
): Array<React.JSX.IntrinsicElements["meta"]> {
    const meta: Array<React.JSX.IntrinsicElements["meta"]> = []

    if (seo.meta.title) meta.push({ name: "title", content: seo.meta.title })
    if (seo.meta.description)
        meta.push({ name: "description", content: seo.meta.description })
    if (seo.meta.robots) meta.push({ name: "robots", content: seo.meta.robots })

    // Open Graph
    if (seo.meta.openGraph?.type)
        meta.push({ property: "og:type", content: seo.meta.openGraph.type })
    if (seo.meta.openGraph?.title)
        meta.push({ property: "og:title", content: seo.meta.openGraph.title })
    if (seo.meta.openGraph?.description)
        meta.push({
            property: "og:description",
            content: seo.meta.openGraph.description
        })
    if (seo.meta.openGraph?.url)
        meta.push({ property: "og:url", content: seo.meta.openGraph.url })
    if (seo.meta.openGraph?.siteName)
        meta.push({
            property: "og:site_name",
            content: seo.meta.openGraph.siteName
        })

    const ogImages = seo.meta.openGraph?.images || []
    for (const img of ogImages) {
        const imgUrl = typeof img === "string" ? img : img.url
        if (imgUrl) meta.push({ property: "og:image", content: imgUrl })
    }

    // Twitter
    if (seo.meta.twitter?.card)
        meta.push({ name: "twitter:card", content: seo.meta.twitter.card })
    if (seo.meta.twitter?.title)
        meta.push({ name: "twitter:title", content: seo.meta.twitter.title })
    if (seo.meta.twitter?.description)
        meta.push({
            name: "twitter:description",
            content: seo.meta.twitter.description
        })

    const twitterImages = seo.meta.twitter?.images || []
    for (const img of twitterImages) {
        if (img) meta.push({ name: "twitter:image", content: img })
    }

    return meta
}

/**
 * Home route - displays list of all published posts
 * Path: /
 */
export const homeRoute = createRoute("/", () => ({
    meta: async (
        routeInfo: RouteInfo,
        serverConfig: BlogDataProvider,
        site?: SeoSiteConfig
    ) => {
        const seo = await resolveSEO(routeInfo, serverConfig, site)
        return seoToMetaElements(seo)
    },
    loader: async (provider: BlogDataProvider, queryClient: QueryClient) => {
        const queries = createBlogQueryKeys(provider)
        const base = queries.posts.list({ limit: 10, published: true })
        await queryClient.prefetchInfiniteQuery({
            ...base,
            initialPageParam: 0,
            staleTime: 1000 * 60 * 5
        })
    },
    extra: () =>
        ({
            type: "home",
            seo: async (
                routeInfo: RouteInfo,
                serverConfig: BlogDataProvider,
                site?: SeoSiteConfig
            ): Promise<BlogPageSEO> => {
                return await resolveSEO(routeInfo, serverConfig, site)
            }
        }) satisfies RouteExtraWithMeta
}))

/**
 * Post route - displays a single post by slug
 * Path: /:slug
 */
export const postRoute = createRoute("/:slug", ({ params }) => ({
    meta: async (
        routeInfo: RouteInfo,
        serverConfig: BlogDataProvider,
        site?: SeoSiteConfig
    ) => {
        const seo = await resolveSEO(routeInfo, serverConfig, site)
        return seoToMetaElements(seo)
    },
    loader: async (provider: BlogDataProvider, queryClient: QueryClient) => {
        const slug = params.slug
        if (!slug) return
        const queries = createBlogQueryKeys(provider)
        const base = queries.posts.detail(slug)
        await queryClient.prefetchQuery({
            ...base,
            staleTime: 1000 * 60 * 5
        })
    },
    extra: () =>
        ({
            type: "post",
            seo: async (
                routeInfo: RouteInfo,
                serverConfig: BlogDataProvider,
                site?: SeoSiteConfig
            ): Promise<BlogPageSEO> => {
                return await resolveSEO(routeInfo, serverConfig, site)
            }
        }) satisfies RouteExtraWithMeta
}))

/**
 * Tag route - displays posts filtered by tag
 * Path: /tag/:tag
 */
export const tagRoute = createRoute("/tag/:tag", ({ params }) => ({
    meta: async (
        routeInfo: RouteInfo,
        serverConfig: BlogDataProvider,
        site?: SeoSiteConfig
    ) => {
        const seo = await resolveSEO(routeInfo, serverConfig, site)
        return seoToMetaElements(seo)
    },
    loader: async (provider: BlogDataProvider, queryClient: QueryClient) => {
        const tag = params.tag
        if (!tag) return
        const queries = createBlogQueryKeys(provider)
        const base = queries.posts.list({ tag, limit: 10 })
        await queryClient.prefetchInfiniteQuery({
            ...base,
            initialPageParam: 0,
            staleTime: 1000 * 60 * 5
        })
    },
    extra: () =>
        ({
            type: "tag" as RouteType,
            seo: async (
                routeInfo: RouteInfo,
                serverConfig: BlogDataProvider,
                site?: SeoSiteConfig
            ): Promise<BlogPageSEO> => {
                return await resolveSEO(routeInfo, serverConfig, site)
            }
        }) satisfies RouteExtraWithMeta
}))

/**
 * Drafts route - displays all draft posts
 * Path: /drafts
 */
export const draftsRoute = createRoute("/drafts", () => ({
    meta: async (
        routeInfo: RouteInfo,
        serverConfig: BlogDataProvider,
        site?: SeoSiteConfig
    ) => {
        const seo = await resolveSEO(routeInfo, serverConfig, site)
        return seoToMetaElements(seo)
    },
    loader: async (provider: BlogDataProvider, queryClient: QueryClient) => {
        const queries = createBlogQueryKeys(provider)
        const base = queries.drafts.list({ limit: 10 })
        await queryClient.prefetchInfiniteQuery({
            ...base,
            initialPageParam: 0,
            staleTime: 1000 * 60 * 5
        })
    },
    extra: () =>
        ({
            type: "drafts" as RouteType,
            seo: async (
                routeInfo: RouteInfo,
                serverConfig: BlogDataProvider,
                site?: SeoSiteConfig
            ): Promise<BlogPageSEO> => {
                return await resolveSEO(routeInfo, serverConfig, site)
            }
        }) satisfies RouteExtraWithMeta
}))

/**
 * New post route - form to create a new post
 * Path: /new
 */
export const newPostRoute = createRoute(
    "/new",
    () => ({
        meta: async (
            routeInfo: RouteInfo,
            serverConfig: BlogDataProvider,
            site?: SeoSiteConfig
        ) => {
            const seo = await resolveSEO(routeInfo, serverConfig, site)
            return seoToMetaElements(seo)
        },
        loader: async (
            _provider: BlogDataProvider,
            _queryClient: QueryClient
        ) => {
            // No data to prefetch for new post form
            return
        },
        extra: () =>
            ({
                type: "new" as RouteType,
                seo: async (
                    routeInfo: RouteInfo,
                    serverConfig: BlogDataProvider,
                    site?: SeoSiteConfig
                ): Promise<BlogPageSEO> => {
                    return await resolveSEO(routeInfo, serverConfig, site)
                }
            }) satisfies RouteExtraWithMeta
    }),
    undefined,
    { isStatic: true }
)

/**
 * Edit post route - form to edit an existing post
 * Path: /:slug/edit
 */
export const editPostRoute = createRoute("/:slug/edit", ({ params }) => ({
    meta: async (
        routeInfo: RouteInfo,
        serverConfig: BlogDataProvider,
        site?: SeoSiteConfig
    ) => {
        const seo = await resolveSEO(routeInfo, serverConfig, site)
        return seoToMetaElements(seo)
    },
    loader: async (provider: BlogDataProvider, queryClient: QueryClient) => {
        const slug = params.slug
        if (!slug) return
        const queries = createBlogQueryKeys(provider)
        const base = queries.posts.detail(slug)
        await queryClient.prefetchQuery({
            ...base,
            staleTime: 1000 * 60 * 5
        })
    },
    extra: () =>
        ({
            type: "edit" as RouteType,
            seo: async (
                routeInfo: RouteInfo,
                serverConfig: BlogDataProvider,
                site?: SeoSiteConfig
            ): Promise<BlogPageSEO> => {
                return await resolveSEO(routeInfo, serverConfig, site)
            }
        }) satisfies RouteExtraWithMeta
}))
