import type {
    Author,
    BlogDataProvider,
    BlogPageMetadata,
    BlogPageSEO,
    Post,
    RouteInfo,
    SeoSiteConfig
} from "@/types"

/**
 * Backwards-compatible API: returns just the metadata portion.
 * Prefer using {@link resolveSEO} for structured data as well.
 */
export async function resolveMetadata(
    routeInfo: RouteInfo,
    provider: BlogDataProvider,
    site?: SeoSiteConfig
): Promise<BlogPageMetadata> {
    const seo = await resolveSEO(routeInfo, provider, site)
    return seo.meta
}

/**
 * Best-in-class SEO resolver for Better Blog.
 * Builds rich metadata and JSON-LD for blog pages and posts.
 */
export async function resolveSEO(
    routeInfo: RouteInfo,
    provider: BlogDataProvider,
    site?: SeoSiteConfig
): Promise<BlogPageSEO> {
    const post = await fetchPostIfNeeded(routeInfo, provider)
    const baseMeta = buildBasePageMetadata(routeInfo, post, site)
    const structuredData = buildStructuredData(routeInfo, post, baseMeta, site)
    return { meta: baseMeta, structuredData }
}

async function fetchPostIfNeeded(
    routeInfo: RouteInfo,
    provider: BlogDataProvider
): Promise<Post | null> {
    if (routeInfo.type !== "post" || !routeInfo.params?.slug) return null
    const slug = routeInfo.params.slug
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

function getDefaultTitle(routeInfo: RouteInfo): string {
    switch (routeInfo.type) {
        case "home":
            return "Blog Posts"
        case "post":
            return routeInfo.params?.slug
                ? `Post: ${routeInfo.params.slug}`
                : "Post"
        case "tag":
            return routeInfo.params?.tag
                ? `Posts tagged: ${routeInfo.params.tag}`
                : "Tag"
        case "drafts":
            return "My Drafts"
        case "new":
            return "Create New Post"
        case "edit":
            return routeInfo.params?.slug
                ? `Editing: ${routeInfo.params.slug}`
                : "Edit Post"
        default:
            return "Unknown"
    }
}

function getDefaultDescription(routeInfo: RouteInfo): string | undefined {
    switch (routeInfo.type) {
        case "home":
            return "Latest blog posts"
        case "post":
            return "Blog post content"
        case "tag":
            return routeInfo.params?.tag
                ? `All posts tagged with ${routeInfo.params.tag}`
                : undefined
        case "drafts":
            return "Draft posts"
        case "new":
            return "Create a new blog post"
        case "edit":
            return "Edit blog post"
        default:
            return undefined
    }
}

function buildBasePageMetadata(
    routeInfo: RouteInfo,
    post: Post | null,
    site?: SeoSiteConfig
): BlogPageMetadata {
    const isPost = Boolean(post)
    const title = post?.title ?? getDefaultTitle(routeInfo)
    const description = post?.excerpt ?? getDefaultDescription(routeInfo)
    const chosenImage = post?.image ?? site?.defaultImageUrl

    // Build canonical URL if siteUrl can be inferred
    const slugPath = derivePathFromRoute(routeInfo)
    const canonicalUrl =
        site?.siteUrl && slugPath
            ? normalizeUrl(`${site.siteUrl}/${slugPath}`)
            : undefined

    const images = chosenImage ? [chosenImage] : undefined

    return {
        title,
        description,
        canonicalUrl,
        robots: deriveRobotsTag(routeInfo, post),
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
    routeInfo: RouteInfo,
    post: Post | null,
    meta: BlogPageMetadata,
    site?: SeoSiteConfig
): Array<Record<string, unknown>> {
    const data: Array<Record<string, unknown>> = []

    if (site?.siteUrl && site?.siteName) {
        data.push(buildWebsiteJsonLd(site))
    }

    // Breadcrumbs for all pages with a path
    const path = derivePathFromRoute(routeInfo)
    if (site?.siteUrl && path) {
        data.push(
            buildBreadcrumbJsonLd(
                site.siteUrl,
                path,
                post?.title ?? getDefaultTitle(routeInfo)
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

function derivePathFromRoute(routeInfo: RouteInfo): string | undefined {
    if (routeInfo.type === "home") return undefined
    if (routeInfo.type === "post" && routeInfo.params?.slug)
        return routeInfo.params.slug
    if (routeInfo.type === "tag" && routeInfo.params?.tag)
        return `tag/${routeInfo.params.tag}`
    // drafts/new/edit treated as-is for canonical construction
    if (routeInfo.type === "drafts") return "drafts"
    if (routeInfo.type === "new") return "new"
    if (routeInfo.type === "edit" && routeInfo.params?.slug)
        return `${routeInfo.params.slug}/edit`
    return undefined
}

function normalizeUrl(url: string): string {
    return url.replace(/([^:])\/\/+/, "$1/")
}

function capitalize(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1)
}

function deriveRobotsTag(
    routeInfo: RouteInfo,
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
        routeInfo.type === "drafts" ||
        routeInfo.type === "new" ||
        routeInfo.type === "edit"
    ) {
        return "noindex,nofollow"
    }
    if (routeInfo.type === "unknown") return "noindex,nofollow"
    return "index,follow"
}
