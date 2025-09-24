import type { BlogDataProvider, Post, RouteMatch, SeoSiteConfig } from "@/types"
import { resolveSEO } from "../meta-resolver"

function createProvider(posts: Post[]): BlogDataProvider {
    return {
        async getAllPosts(filter) {
            if (!filter?.slug) return posts
            return posts.filter((p) => p.slug === filter.slug)
        },
        async getPostBySlug(slug: string) {
            return posts.find((p) => p.slug === slug) ?? null
        }
    }
}

const basePost: Post = {
    id: "1",
    slug: "hello-world",
    title: "Hello World",
    excerpt: "An intro post",
    content: "...",
    image: "https://cdn.example.com/hello.jpg",
    published: true,
    status: "PUBLISHED",
    publishedAt: new Date("2024-01-01T00:00:00Z"),
    tags: [],
    createdAt: new Date("2023-12-31T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
    author: {
        id: "a1",
        name: "Jane Doe",
        image: "https://cdn.example.com/jane.png"
    }
}

const site: SeoSiteConfig = {
    siteUrl: "https://example.com",
    siteName: "Example Blog",
    publisherName: "Example Inc",
    publisherLogoUrl: "https://cdn.example.com/logo.png",
    defaultLocale: "en_US",
    twitterSite: "@example",
    twitterCreator: "@jane",
    defaultImageUrl: "https://cdn.example.com/default.jpg"
}

describe("resolveSEO", () => {
    test("uses post data for post route and builds JSON-LD", async () => {
        const provider = createProvider([basePost])
        const match: RouteMatch = {
            type: "post",
            params: { slug: "hello-world" },
            metadata: { title: "Fallback Title", description: "Fallback Desc" }
        }

        const seo = await resolveSEO(match, provider, site)
        expect(seo.meta.title).toBe("Hello World")
        expect(seo.meta.description).toBe("An intro post")
        expect(seo.meta.openGraph?.images?.length).toBe(1)
        expect(seo.meta.twitter?.card).toBe("summary_large_image")
        expect(seo.meta.canonicalUrl).toBe("https://example.com/hello-world")
        // Has BlogPosting JSON-LD
        expect(
            seo.structuredData.some((obj) => obj["@type"] === "BlogPosting")
        ).toBe(true)
    })

    test("falls back to route metadata when post not found", async () => {
        const provider = createProvider([])
        const match: RouteMatch = {
            type: "post",
            params: { slug: "missing" },
            metadata: {
                title: "Route Title",
                description: "Route Desc",
                image: "https://img/route.png"
            }
        }
        const seo = await resolveSEO(match, provider, site)
        expect(seo.meta.title).toBe("Route Title")
        expect(seo.meta.description).toBe("Route Desc")
        expect(seo.meta.twitter?.card).toBe("summary_large_image")
    })

    test("sets noindex for drafts and unpublished posts", async () => {
        const draft: Post = {
            ...basePost,
            slug: "draft",
            published: false,
            status: "DRAFT",
            publishedAt: undefined
        }
        const provider = createProvider([draft])
        const match: RouteMatch = {
            type: "post",
            params: { slug: "draft" },
            metadata: { title: "Draft" }
        }
        const seo = await resolveSEO(match, provider, site)
        expect(seo.meta.robots).toBe("noindex,nofollow")
    })
})
