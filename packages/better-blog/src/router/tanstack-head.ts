import type {
    BlogDataProvider,
    BlogPageSEO,
    RouteMatch,
    SeoSiteConfig
} from "@/types"
import { resolveSEO } from "./meta-resolver"

export type TanStackHead = {
    meta?: Array<{
        name?: string
        property?: string
        content?: string
        title?: string
    }>
    links?: Array<{ rel: string; href: string }>
}

/**
 * Build TanStack Router-compatible head() output from Better Blog SEO.
 * Use either a precomputed match or a path string (no leading slash).
 */
export async function buildTanStackHead(options: {
    match?: RouteMatch
    path?: string
    provider: BlogDataProvider
    site?: SeoSiteConfig
}): Promise<TanStackHead> {
    const match =
        options.match ??
        (await import("./blog-router-client")).matchRouteClient(
            options.path?.split("/").filter(Boolean)
        )
    const seo: BlogPageSEO = await resolveSEO(
        match,
        options.provider,
        options.site
    )

    // Map core tags
    const meta: TanStackHead["meta"] = []

    if (seo.meta.title) meta.push({ title: seo.meta.title })
    if (seo.meta.description)
        meta.push({ name: "description", content: seo.meta.description })
    if (seo.meta.robots) meta.push({ name: "robots", content: seo.meta.robots })

    // Open Graph
    meta.push({
        property: "og:type",
        content: (seo.meta.openGraph?.type ??
            (seo.meta.openGraph?.title ? "article" : "website")) as string
    })
    if (seo.meta.openGraph?.title ?? seo.meta.title) {
        meta.push({
            property: "og:title",
            content: (seo.meta.openGraph?.title ?? seo.meta.title) as string
        })
    }
    if (seo.meta.openGraph?.description ?? seo.meta.description) {
        meta.push({
            property: "og:description",
            content: (seo.meta.openGraph?.description ??
                seo.meta.description) as string
        })
    }
    if (seo.meta.openGraph?.url)
        meta.push({ property: "og:url", content: seo.meta.openGraph.url })
    const ogImage = seo.meta.openGraph?.images?.[0]
    const ogImageUrl = typeof ogImage === "string" ? ogImage : ogImage?.url
    if (ogImageUrl) meta.push({ property: "og:image", content: ogImageUrl })

    // Twitter
    meta.push({
        name: "twitter:card",
        content:
            seo.meta.twitter?.card ??
            (ogImageUrl ? "summary_large_image" : "summary")
    })
    if (seo.meta.twitter?.title ?? seo.meta.title) {
        meta.push({
            name: "twitter:title",
            content: (seo.meta.twitter?.title ?? seo.meta.title) as string
        })
    }
    if (seo.meta.twitter?.description ?? seo.meta.description) {
        meta.push({
            name: "twitter:description",
            content: (seo.meta.twitter?.description ??
                seo.meta.description) as string
        })
    }
    if (ogImageUrl) meta.push({ name: "twitter:image", content: ogImageUrl })

    // Links
    const links: TanStackHead["links"] = []
    if (seo.meta.canonicalUrl)
        links.push({ rel: "canonical", href: seo.meta.canonicalUrl })

    return { meta: meta.filter(Boolean), links }
}
