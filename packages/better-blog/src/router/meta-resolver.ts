import type {
    Author,
    BlogDataProvider,
    BlogPageMetadata,
    BlogPageSEO,
    Post,
    RouteMatch,
    SeoSiteConfig
} from "@/types"

/**
 * Backwards-compatible API: returns just the metadata portion.
 * Prefer using {@link resolveSEO} for structured data as well.
 */
export async function resolveMetadata(
    match: RouteMatch,
    provider: BlogDataProvider,
    site?: SeoSiteConfig
): Promise<BlogPageMetadata> {
    const seo = await resolveSEO(match, provider, site)
    return seo.meta
}

/**
 * Best-in-class SEO resolver for Better Blog.
 * Builds rich metadata and JSON-LD for blog pages and posts.
 */
export async function resolveSEO(
    match: RouteMatch,
    provider: BlogDataProvider,
    site?: SeoSiteConfig
): Promise<BlogPageSEO> {
    const post = await fetchPostIfNeeded(match, provider)
    const baseMeta = buildBasePageMetadata(match, post, site)
    const structuredData = buildStructuredData(match, post, baseMeta, site)
    return { meta: baseMeta, structuredData }
}

async function fetchPostIfNeeded(
    match: RouteMatch,
    provider: BlogDataProvider
): Promise<Post | null> {
    if (match.type !== "post" || !match.params?.slug) return null
    const slug = match.params.slug
    try {
        const direct = await provider.getPostBySlug?.(slug)
        if (direct) return direct
        const list = await provider.getAllPosts({ slug })
        return list.find((p) => p.slug === slug) ?? null
    } catch (error) {
        console.error("Error fetching post for SEO:", error)
        return null
    }
}

function buildBasePageMetadata(
    match: RouteMatch,
    post: Post | null,
    site?: SeoSiteConfig
): BlogPageMetadata {
    const isPost = Boolean(post)
    const title = post?.title ?? match.metadata.title
    const description = post?.excerpt ?? match.metadata.description
    const chosenImage =
        post?.image ?? match.metadata.image ?? site?.defaultImageUrl

    // Build canonical URL if siteUrl can be inferred
    const slugPath = derivePathFromMatch(match)
    const canonicalUrl =
        site?.siteUrl && slugPath
            ? normalizeUrl(`${site.siteUrl}/${slugPath}`)
            : undefined

    const images = chosenImage ? [chosenImage] : undefined

    return {
        title,
        description,
        canonicalUrl,
        robots: deriveRobotsTag(match, post),
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            type: isPost ? "article" : "website",
            siteName: site?.siteName,
            images
        },
        twitter: {
            card: chosenImage ? "summary_large_image" : "summary",
            title,
            description,
            images
        }
    }
}

function buildStructuredData(
    match: RouteMatch,
    post: Post | null,
    meta: BlogPageMetadata,
    site?: SeoSiteConfig
): Array<Record<string, unknown>> {
    const data: Array<Record<string, unknown>> = []

    if (site?.siteUrl && site?.siteName) {
        data.push(buildWebsiteJsonLd(site))
    }

    // Breadcrumbs for all pages with a path
    const path = derivePathFromMatch(match)
    if (site?.siteUrl && path) {
        data.push(
            buildBreadcrumbJsonLd(
                site.siteUrl,
                path,
                post?.title ?? match.metadata.title
            )
        )
    }

    if (post) {
        data.push(buildBlogPostingJsonLd(post, meta.canonicalUrl, site))
    } else {
        // Generic WebPage
        if (meta.canonicalUrl) {
            data.push({
                "@context": "https://schema.org",
                "@type": "WebPage",
                url: meta.canonicalUrl,
                name: meta.title,
                description: meta.description
            })
        }
    }

    return data
}

function buildWebsiteJsonLd(site: SeoSiteConfig): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: site.siteName,
        url: site.siteUrl
    }
}

function buildBreadcrumbJsonLd(
    siteUrl: string,
    path: string,
    lastItemTitle: string
): Record<string, unknown> {
    const segments = path.split("/").filter(Boolean)
    const itemListElements = segments.map((seg, index) => {
        const url = normalizeUrl(
            `${siteUrl}/${segments.slice(0, index + 1).join("/")}`
        )
        const name =
            index === segments.length - 1 ? lastItemTitle : capitalize(seg)
        return {
            "@type": "ListItem",
            position: index + 1,
            name,
            item: url
        }
    })
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: itemListElements
    }
}

function buildBlogPostingJsonLd(
    post: Post,
    canonicalUrl?: string,
    site?: SeoSiteConfig
): Record<string, unknown> {
    const images = post.image
        ? [post.image]
        : site?.defaultImageUrl
          ? [site.defaultImageUrl]
          : undefined
    const publisher = site?.publisherName
        ? {
              "@type": "Organization",
              name: site.publisherName,
              logo: site.publisherLogoUrl
                  ? { "@type": "ImageObject", url: site.publisherLogoUrl }
                  : undefined
          }
        : undefined
    const author = buildAuthorJsonLd(post.author)
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        image: images,
        url: canonicalUrl,
        datePublished: post.publishedAt?.toISOString?.() ?? undefined,
        dateModified: post.updatedAt?.toISOString?.() ?? undefined,
        author,
        publisher,
        mainEntityOfPage: canonicalUrl
            ? { "@type": "WebPage", "@id": canonicalUrl }
            : undefined
    }
}

function buildAuthorJsonLd(
    author: Author | null
): Record<string, unknown> | undefined {
    if (!author) return undefined
    return {
        "@type": "Person",
        name: author.name,
        image: author.image
    }
}

function derivePathFromMatch(match: RouteMatch): string | undefined {
    if (match.type === "home") return undefined
    if (match.type === "post" && match.params?.slug) return match.params.slug
    if (match.type === "tag" && match.params?.tag)
        return `tag/${match.params.tag}`
    // drafts/new/edit treated as-is for canonical construction
    if (match.type === "drafts") return "drafts"
    if (match.type === "new") return "new"
    if (match.type === "edit" && match.params?.slug)
        return `${match.params.slug}/edit`
    return undefined
}

function normalizeUrl(url: string): string {
    return url.replace(/([^:])\/\/+/, "$1/")
}

function capitalize(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1)
}

function deriveRobotsTag(
    match: RouteMatch,
    post: Post | null
): string | undefined {
    // Default: index all non-unknown routes
    if (post) {
        const isPublished = Boolean(
            post.published || post.status === "PUBLISHED" || post.publishedAt
        )
        return isPublished ? "index,follow" : "noindex,nofollow"
    }
    if (
        match.type === "drafts" ||
        match.type === "new" ||
        match.type === "edit"
    ) {
        return "noindex,nofollow"
    }
    if (match.type === "unknown") return "noindex,nofollow"
    return "index,follow"
}
