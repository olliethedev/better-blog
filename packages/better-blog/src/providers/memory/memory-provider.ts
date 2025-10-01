import type {
    BlogDataProvider,
    BlogDataProviderConfig,
    Post,
    Tag
} from "@/types"
import { getTestPosts } from "../../lib/data"
import { slugify } from "../../lib/format-utils"
import type {
    PostCreateExtendedInput,
    PostUpdateExtendedInput
} from "../../schema/post"
import type { CreateMemoryProviderOptions } from "./types"

function generateId(prefix = "p"): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function normalizeQuery(q?: string): string {
    return (q ?? "").toLowerCase().trim()
}

// Extra tag input shapes supported by the memory provider to match form submissions
type CreateTagConnectOrCreate = {
    tag: {
        connectOrCreate: {
            where: { name: string }
            create: { name: string; slug: string }
        }
    }
}

type CreateTagsInput = {
    tags?: Array<string | CreateTagConnectOrCreate>
}

type UpdateTagsInput = {
    tags?: {
        deleteMany?: Record<string, never>
        create?: Array<CreateTagConnectOrCreate>
    }
}

export async function createMemoryProvider(
    options?: CreateMemoryProviderOptions
): Promise<BlogDataProvider> {
    const posts: Post[] = Array.isArray(options?.seedPosts)
        ? [...options.seedPosts]
        : []

    function upsertTagsFromNames(names: string[]): Tag[] {
        const seenLowerNameToOriginal = new Map<string, string>()
        for (const rawName of names) {
            const trimmed = (rawName ?? "").trim()
            if (!trimmed) continue
            const lower = trimmed.toLowerCase()
            if (!seenLowerNameToOriginal.has(lower)) {
                // Preserve the original casing of the first occurrence
                seenLowerNameToOriginal.set(lower, trimmed)
            }
        }

        const originalNames = Array.from(seenLowerNameToOriginal.values())
        return originalNames.map((originalName, idx) => ({
            id: `t_${slugify(originalName)}_${idx}`,
            name: originalName,
            slug: slugify(originalName)
        }))
    }

    function getAllPostsInternal(filter?: {
        slug?: string
        tag?: string
        offset?: number
        limit?: number
        query?: string
        published?: boolean
    }): Post[] {
        const { slug, tag, offset = 0, limit, query, published } = filter ?? {}

        let result = posts.slice().sort((a, b) => {
            const aDate = a.publishedAt ?? a.createdAt
            const bDate = b.publishedAt ?? b.createdAt
            return bDate.getTime() - aDate.getTime()
        })

        if (slug) {
            result = result.filter((p) => p.slug === slug)
        }

        if (tag) {
            const tagLower = tag.toLowerCase()
            result = result.filter((p) =>
                (p.tags ?? []).some(
                    (t) =>
                        t.slug.toLowerCase() === tagLower ||
                        t.name.toLowerCase() === tagLower
                )
            )
        }

        if (query && query.trim().length > 0) {
            const q = normalizeQuery(query)
            result = result.filter((p) => {
                const hay = [p.title, p.excerpt, p.content]
                    .join("\n")
                    .toLowerCase()
                return hay.includes(q)
            })
        }

        if (typeof published === "boolean") {
            result = result.filter((p) => p.published === published)
        }

        if (typeof limit === "number") {
            return result.slice(offset, offset + limit)
        }
        return result.slice(offset)
    }

    const provider: BlogDataProvider = {
        async getAllPosts(filter) {
            return getAllPostsInternal(filter)
        },

        async getPostBySlug(slug: string, _options?: { locale?: string }) {
            return posts.find((p) => p.slug === slug) ?? null
        },

        async createPost(input: PostCreateExtendedInput) {
            const now = new Date()
            const id = input.id ?? generateId()
            const slug =
                input.slug && input.slug.trim().length > 0
                    ? input.slug
                    : slugify(input.title)

            // Best-effort tag extraction for memory store
            // Support two shapes: direct tags array on input or Prisma-like nested create
            let tags: Tag[] = []
            const anyInput = input as PostCreateExtendedInput & CreateTagsInput
            if (Array.isArray(anyInput.tags)) {
                // array of strings or objects with tag.connectOrCreate
                const tagNames: string[] = []
                for (const item of anyInput.tags) {
                    if (typeof item === "string") tagNames.push(item)
                    else if (item?.tag?.connectOrCreate?.create?.name) {
                        tagNames.push(item.tag.connectOrCreate.create.name)
                    }
                }
                tags = upsertTagsFromNames(tagNames)
            }

            const author =
                (await options?.getAuthor?.(input.authorId ?? "")) ?? null

            const newPost: Post = {
                id,
                slug,
                title: input.title,
                content: input.content,
                excerpt: input.excerpt ?? "",
                image: input.image,
                published: input.published ?? false,
                publishedAt:
                    (input.published ?? false)
                        ? (input.updatedAt ?? now)
                        : undefined,
                tags,
                createdAt: input.createdAt ?? now,
                updatedAt: input.updatedAt ?? now,
                authorId: input.authorId,
                author: author
            }

            posts.unshift(newPost)
            return newPost
        },

        async updatePost(slug: string, input: PostUpdateExtendedInput) {
            const idx = posts.findIndex((p) => p.slug === slug)
            if (idx === -1) throw new Error("Post not found")

            const existing = posts[idx]
            const now = new Date()
            const nextSlug = input.slug ?? existing.slug

            // Handle tags reset/create in a loose, memory-friendly way
            let tags = existing.tags
            const anyInput = input as PostUpdateExtendedInput & UpdateTagsInput
            if (anyInput.tags) {
                const tagNames: string[] = []
                // deleteMany clears
                // then create adds provided names
                if (Array.isArray(anyInput.tags.create)) {
                    for (const c of anyInput.tags.create) {
                        const name: string | undefined =
                            c?.tag?.connectOrCreate?.create?.name
                        if (name) tagNames.push(name)
                    }
                }
                tags = upsertTagsFromNames(tagNames)
            }

            const updated: Post = {
                ...existing,
                title: input.title,
                content: input.content,
                excerpt: input.excerpt ?? existing.excerpt,
                slug: nextSlug,
                image: input.image ?? existing.image,
                published: input.published ?? existing.published,
                publishedAt:
                    (input.published ?? existing.published)
                        ? (input.updatedAt ?? now)
                        : undefined,
                tags,
                updatedAt: input.updatedAt ?? now
            }

            posts[idx] = updated
            return updated
        },

        async deletePost(slug: string) {
            const idx = posts.findIndex((p) => p.slug === slug)
            if (idx !== -1) posts.splice(idx, 1)
        }
    }
    return provider
}

// Convenience: a pre-seeded provider using demo posts, for quick prototyping
export async function createSeededMemoryProvider(
    options?: BlogDataProviderConfig
): Promise<BlogDataProvider> {
    const rawPosts = getTestPosts()
    const authorId = "1"
    const baseAuthor =
        (await options?.getAuthor?.(authorId)) ??
        { id: authorId, name: "John Doe" }
    const posts = rawPosts.map((post) => {
        const effectiveAuthor = post.author ?? baseAuthor
        return {
            ...post,
            authorId,
            // Clone to avoid shared object references that some serializers encode as circular refs
            author: effectiveAuthor ? { ...effectiveAuthor } : null
        }
    })

    return createMemoryProvider({ seedPosts: posts, ...options })
}
