import type { BlogDataProvider, Post, SeoSiteConfig } from "@/types"
import { buildTanStackHead } from "../tanstack-head"

function providerWith(posts: Post[]): BlogDataProvider {
    return {
        async getAllPosts(filter) {
            if (!filter?.slug) return posts
            return posts.filter((p) => p.slug === filter.slug)
        },
        async getPostBySlug(slug) {
            return posts.find((p) => p.slug === slug) ?? null
        }
    }
}

const post: Post = {
    id: "1",
    slug: "hello-world",
    title: "Hello World",
    excerpt: "Intro",
    content: "...",
    image: "https://img/og.jpg",
    published: true,
    status: "PUBLISHED",
    publishedAt: new Date("2024-01-01T00:00:00Z"),
    tags: [],
    createdAt: new Date("2023-12-31T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
    author: { id: "a", name: "A" }
}

const site: SeoSiteConfig = { siteUrl: "https://example.com", siteName: "Site" }

describe("buildTanStackHead", () => {
    test("maps SEO into TanStack meta & links", async () => {
        const head = await buildTanStackHead({
            path: "hello-world",
            provider: providerWith([post]),
            site
        })
        const meta = head.meta || []
        expect(meta.some((m) => m.title === "Hello World")).toBe(true)
        expect(
            meta.some((m) => m.name === "description" && m.content === "Intro")
        ).toBe(true)
        expect(
            meta.some(
                (m) => m.property === "og:title" && m.content === "Hello World"
            )
        ).toBe(true)
        expect(
            meta.some(
                (m) =>
                    m.name === "twitter:card" &&
                    m.content === "summary_large_image"
            )
        ).toBe(true)
        expect(head.links?.some((l) => l.rel === "canonical")).toBe(true)
    })
})
