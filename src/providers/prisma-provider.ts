

import { DEFAULT_LOCALE } from "@/lib/constants"
import { slugify } from "@/lib/format-utils"
import type { BlogDataProviderConfig } from "@/types"
import type { BlogDataProvider } from "@/types"
import type { PostCreateExtendedInput, PostUpdateExtendedInput } from "../schema/post"

// biome-ignore lint/suspicious/noEmptyInterface: Library consumer provides PrismaClient
interface PrismaClient {}

// Very loose typing on purpose: consumer's Prisma client is external to this lib
interface PrismaClientInternal {
	// Transaction API
	// biome-ignore lint/suspicious/noExplicitAny: external type
	$transaction: any
	[model: string]: {
		// biome-ignore lint/suspicious/noExplicitAny: external type
		create: (args: any) => Promise<any>
		// biome-ignore lint/suspicious/noExplicitAny: external type
		findFirst: (args: any) => Promise<any>
		// biome-ignore lint/suspicious/noExplicitAny: external type
		findMany: (args: any) => Promise<any>
		// biome-ignore lint/suspicious/noExplicitAny: external type
		findUnique?: (args: any) => Promise<any>
		// biome-ignore lint/suspicious/noExplicitAny: external type
		update: (args: any) => Promise<any>
		// biome-ignore lint/suspicious/noExplicitAny: external type
		delete: (args: any) => Promise<any>
		// biome-ignore lint/suspicious/noExplicitAny: external type
		deleteMany?: (args: any) => Promise<any>
		// biome-ignore lint/suspicious/noExplicitAny: external type
		upsert?: (args: any) => Promise<any>
		// biome-ignore lint/suspicious/noExplicitAny: external type
		[key: string]: any
	}
}

export interface PrismaProviderOptions extends BlogDataProviderConfig {
    prisma: PrismaClient
}

export async function createPrismaProvider(options: PrismaProviderOptions): Promise<BlogDataProvider> {
    const { prisma, defaultLocale: providerDefaultLocale = DEFAULT_LOCALE, getAuthor } = options
    const db = prisma as unknown as PrismaClientInternal

    async function fetchOneBySlug(theSlug: string, locale: string) {
        const post = await (db as any).post.findFirst({
            where: {
                OR: [
                    { slug: theSlug },
                    {
                        i18n: {
                            some: {
                                locale,
                                slug: theSlug
                            }
                        }
                    }
                ]
            },
            include: {
                i18n: {
                    where: { locale },
                    take: 1
                },
                tags: {
                    include: {
                        tag: {
                            include: {
                                i18n: {
                                    where: { locale },
                                    take: 1
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!post) return null

        const loc = Array.isArray(post.i18n) && post.i18n.length > 0 ? post.i18n[0] : null
        const isPublished = post.status === "PUBLISHED"

        // Map tags with locale fallback
        const tags = (post.tags ?? []).map((pt: any) => {
            const t = pt.tag
            const tLoc = Array.isArray(t?.i18n) && t.i18n.length > 0 ? t.i18n[0] : null
            return {
                id: t.id,
                name: (tLoc?.name ?? t.name) as string,
                slug: (tLoc?.slug ?? t.slug) as string
            }
        })

        const author = (post.authorId && getAuthor ? await getAuthor(post.authorId as string) : null) ?? {
            id: post.authorId ?? "",
            name: "Unknown"
        }

        return {
            id: post.id as string,
            authorId: (post.authorId as string | null) ?? undefined,
            slug: (loc?.slug ?? post.slug) as string,
            title: (loc?.title ?? post.title) as string,
            content: (loc?.content ?? post.content) as string,
            excerpt: (loc?.excerpt ?? post.excerpt) as string,
            image: (post.image as string | null) ?? undefined,
            published: isPublished,
            publishedAt: isPublished ? (post.updatedAt as Date) : undefined,
            tags,
            createdAt: post.createdAt as Date,
            updatedAt: post.updatedAt as Date,
            author
        }
    }

    const provider: BlogDataProvider = {
        getAllPosts: async ({
            slug,
            tag,
            offset,
            limit,
            query,
            published,
            locale = providerDefaultLocale
        }: { slug?: string; tag?: string; offset?: number; limit?: number; query?: string; published?: boolean; locale?: string } = {}) => {
            const q = (query ?? "").trim()

            const where: any = {
                AND: [] as any[]
            }

            if (slug) {
                where.AND.push({
                    OR: [
                        { slug },
                        { i18n: { some: { locale, slug } } }
                    ]
                })
            }

            if (typeof published === "boolean") {
                where.AND.push({ status: published ? "PUBLISHED" : "DRAFT" })
            }

            if (tag) {
                const normalizedTag = slugify(tag)
                where.AND.push({
                    tags: {
                        some: {
                            tag: {
                                OR: [
                                    { slug: normalizedTag },
                                    { name: tag },
                                    { i18n: { some: { locale, OR: [{ slug: normalizedTag }, { name: tag }] } } }
                                ]
                            }
                        }
                    }
                })
            }

            if (q.length > 0) {
                where.AND.push({
                    OR: [
                        { title: { contains: q } },
                        { excerpt: { contains: q } },
                        { content: { contains: q } },
                        {
                            i18n: {
                                some: {
                                    locale,
                                    OR: [
                                        { title: { contains: q } },
                                        { excerpt: { contains: q } },
                                        { content: { contains: q } }
                                    ]
                                }
                            }
                        }
                    ]
                })
            }

            const posts = await (db as any).post.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: typeof offset === "number" && offset > 0 ? offset : undefined,
                take: typeof limit === "number" ? limit : undefined,
                include: {
                    i18n: { where: { locale }, take: 1 },
                    tags: {
                        include: {
                            tag: {
                                include: { i18n: { where: { locale }, take: 1 } }
                            }
                        }
                    }
                }
            })

            if (!posts || posts.length === 0) return []

            const mapped = await Promise.all(
                posts.map(async (p: any) => {
                    const loc = Array.isArray(p.i18n) && p.i18n.length > 0 ? p.i18n[0] : null
                    const isPublished = p.status === "PUBLISHED"
                    const tags = (p.tags ?? []).map((pt: any) => {
                        const t = pt.tag
                        const tLoc = Array.isArray(t?.i18n) && t.i18n.length > 0 ? t.i18n[0] : null
                        return {
                            id: t.id,
                            name: (tLoc?.name ?? t.name) as string,
                            slug: (tLoc?.slug ?? t.slug) as string
                        }
                    })

                    const author = (p.authorId && getAuthor ? await getAuthor(p.authorId as string) : null) ?? {
                        id: p.authorId ?? "",
                        name: "Unknown"
                    }

                    return {
                        id: p.id as string,
                        authorId: (p.authorId as string | null) ?? undefined,
                        slug: (loc?.slug ?? p.slug) as string,
                        title: (loc?.title ?? p.title) as string,
                        content: (loc?.content ?? p.content) as string,
                        excerpt: (loc?.excerpt ?? p.excerpt) as string,
                        image: (p.image as string | null) ?? undefined,
                        published: isPublished,
                        publishedAt: isPublished ? (p.updatedAt as Date) : undefined,
                        tags,
                        createdAt: p.createdAt as Date,
                        updatedAt: p.updatedAt as Date,
                        author
                    }
                })
            )

            return mapped
        },

        getPostBySlug: async (theSlug: string, options?: { locale?: string }) => {
            const loc = options?.locale ?? providerDefaultLocale
            const post = await fetchOneBySlug(theSlug, loc)
            return post ?? null
        },

        createPost: async (input: PostCreateExtendedInput) => {
            const now = new Date()
            const createdAt = input.createdAt ?? now
            const updatedAt = input.updatedAt ?? now
            const baseSlug = (input.slug && input.slug.trim().length > 0) ? input.slug : slugify(input.title)

            const created = await (db as any).$transaction(async (tx: any) => {
                const inserted = await tx.post.create({
                    data: {
                        authorId: input.authorId ?? null,
                        defaultLocale: DEFAULT_LOCALE,
                        title: input.title,
                        slug: baseSlug,
                        excerpt: input.excerpt ?? "",
                        content: input.content,
                        image: input.image ?? null,
                        status: (input.published ?? false) ? "PUBLISHED" : "DRAFT",
                        createdAt,
                        updatedAt
                    },
                    select: { id: true }
                })

                const postId = inserted.id as string

                const maybeTags = (input as unknown as { tags?: Array<string | { tag?: { connectOrCreate?: { where?: { name?: string }; create?: { name?: string; slug?: string } } } }> }).tags

                if (Array.isArray(maybeTags) && maybeTags.length > 0) {
                    for (const item of maybeTags) {
                        const tagName = typeof item === "string" ? item : item?.tag?.connectOrCreate?.create?.name
                        if (!tagName) continue
                        const tagSlug = slugify(tagName)

                        const tag = await (tx.tag?.upsert
                            ? tx.tag.upsert({
                                where: { slug: tagSlug },
                                update: {},
                                create: { defaultLocale: DEFAULT_LOCALE, name: tagName, slug: tagSlug, updatedAt: now },
                                select: { id: true }
                            })
                            : tx.tag.findFirst({ where: { slug: tagSlug }, select: { id: true } })
                        )

                        const tagId = tag?.id ?? (await tx.tag.create({
                            data: { defaultLocale: DEFAULT_LOCALE, name: tagName, slug: tagSlug, updatedAt: now },
                            select: { id: true }
                        })).id

                        // Connect
                        await tx.postTag.create({ data: { postId, tagId } })
                    }
                }

                return postId
            })

            const post = await fetchOneBySlug(baseSlug, DEFAULT_LOCALE)
            if (!post) throw new Error("Failed to create post")
            return post
        },

        updatePost: async (slug: string, input: PostUpdateExtendedInput) => {
            const now = new Date()
            const nextUpdatedAt = input.updatedAt ?? now

            const updated = await (db as any).$transaction(async (tx: any) => {
                const existing = (tx.post?.findUnique
                    ? await tx.post.findUnique({ where: { slug } })
                    : await tx.post.findFirst({ where: { slug } })
                )

                if (!existing) throw new Error("Post not found")

                const nextSlug = input.slug ?? existing.slug
                const nextStatus = typeof input.published === "boolean" ? (input.published ? "PUBLISHED" : "DRAFT") : existing.status

                await tx.post.update({
                    where: { id: existing.id },
                    data: {
                        title: input.title,
                        content: input.content,
                        excerpt: input.excerpt ?? existing.excerpt,
                        slug: nextSlug,
                        image: input.image ?? existing.image,
                        status: nextStatus,
                        updatedAt: nextUpdatedAt,
                        version: (existing.version ?? 1) + 1
                    }
                })

                const tagOps = (input as unknown as { tags?: { deleteMany?: Record<string, never>; create?: Array<{ tag?: { connectOrCreate?: { create?: { name?: string; slug?: string } } } }> } }).tags

                if (tagOps) {
                    if (tagOps.deleteMany) {
                        await (tx.postTag?.deleteMany
                            ? tx.postTag.deleteMany({ where: { postId: existing.id } })
                            : tx.postTag.delete({ where: { postId_tagId: { postId: existing.id, tagId: "" } } }) // best-effort fallback; deleteMany preferred
                        )
                    }

                    if (Array.isArray(tagOps.create) && tagOps.create.length > 0) {
                        for (const c of tagOps.create) {
                            const tagName = (c as any)?.tag?.connectOrCreate?.create?.name || (typeof c === "string" ? c : undefined)
                            if (!tagName) continue
                            const tagSlug = slugify(tagName)

                            const tag = await (tx.tag?.upsert
                                ? tx.tag.upsert({
                                    where: { slug: tagSlug },
                                    update: {},
                                    create: { defaultLocale: DEFAULT_LOCALE, name: tagName, slug: tagSlug, updatedAt: now },
                                    select: { id: true }
                                })
                                : tx.tag.findFirst({ where: { slug: tagSlug }, select: { id: true } })
                            )
                            const tagId = tag?.id ?? (await tx.tag.create({
                                data: { defaultLocale: DEFAULT_LOCALE, name: tagName, slug: tagSlug, updatedAt: now },
                                select: { id: true }
                            })).id

                            // Avoid duplicate connections if already linked
                            const existingLink = (tx.postTag?.findUnique
                                ? await tx.postTag.findUnique({ where: { postId_tagId: { postId: existing.id, tagId } } })
                                : await tx.postTag.findFirst({ where: { postId: existing.id, tagId } })
                            )
                            if (!existingLink) {
                                await tx.postTag.create({ data: { postId: existing.id, tagId } })
                            }
                        }
                    }
                }

                return nextSlug
            })

            const post = await fetchOneBySlug(updated, DEFAULT_LOCALE)
            if (!post) throw new Error("Failed to update post")
            return post
        },

        deletePost: async (slug: string) => {
            await (db as any).$transaction(async (tx: any) => {
                const existing = (tx.post?.findUnique
                    ? await tx.post.findUnique({ where: { slug }, select: { id: true } })
                    : await tx.post.findFirst({ where: { slug }, select: { id: true } })
                )
                if (!existing) return

                await (tx.postTag?.deleteMany
                    ? tx.postTag.deleteMany({ where: { postId: existing.id } })
                    : undefined)
                await (tx.postI18n?.deleteMany
                    ? tx.postI18n.deleteMany({ where: { postId: existing.id } })
                    : undefined)
                await tx.post.delete({ where: { id: existing.id } })
            })
        }
    }

    return provider
}