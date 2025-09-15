import { DEFAULT_PAGES_BASE_PATH } from "@/lib/constants"
import { joinPaths, normalizeBasePath, normalizeBaseURL } from "@/lib/utils"
import type { Post } from "@/types"
import type { BlogSitemapOptions, Sitemap } from "./types"


function getPostLastModified(post: Post): Date | undefined {
    return post.updatedAt ?? post.publishedAt ?? post.createdAt
}

export async function createBlogSitemap(
    options: BlogSitemapOptions
): Promise<Sitemap> {
    // TODO: add localization support
    const origin = normalizeBaseURL(options.baseURL)
    const base = normalizeBasePath(options.basePath ?? DEFAULT_PAGES_BASE_PATH)

    const posts =
        (await options.provider.getAllPosts({ published: true })) ?? []

    // Home/index page under the blog base path
    const latestPostDate = posts
        .map((p) => getPostLastModified(p)?.getTime() ?? 0)
        .reduce((a, b) => Math.max(a, b), 0)

    const sitemap: Sitemap = []

    const indexUrl = base === "" ? origin : `${origin}${base}`
    sitemap.push({
        url: indexUrl,
        lastModified: latestPostDate ? new Date(latestPostDate) : undefined,
        changeFrequency: "daily",
        priority: 0.7
    })

    // Individual post pages
    for (const post of posts) {
        const postUrl = `${origin}${joinPaths(base, post.slug)}`
        sitemap.push({
            url: postUrl,
            lastModified: getPostLastModified(post),
            changeFrequency: "monthly",
            priority: 0.6
        })
    }

    // Tag index pages (derived from posts' tags)
    const tagSlugs = Array.from(
        new Set(
            posts.flatMap(
                (p) => p.tags?.map((t) => t.slug).filter(Boolean) ?? []
            )
        )
    )
    for (const tag of tagSlugs) {
        const tagUrl = `${origin}${joinPaths(base, "tag", tag)}`
        const tagMaxTime = posts
            .filter((p) => p.tags?.some((t) => t.slug === tag))
            .map((p) => getPostLastModified(p)?.getTime() ?? 0)
            .reduce((a, b) => (a > b ? a : b), 0)

        sitemap.push({
            url: tagUrl,
            // Use latest post in tag as last modified if available
            lastModified: tagMaxTime ? new Date(tagMaxTime) : undefined,
            changeFrequency: "weekly",
            priority: 0.5
        })
    }

    return sitemap
}


