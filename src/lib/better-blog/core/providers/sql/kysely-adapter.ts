import { slugify } from "@/lib/format-utils"
import type { Kysely } from "kysely"
import { sql } from "kysely"
import type { BlogDataProvider } from "../../types"
import type { KyselyDatabaseType } from "./dialect"

interface KyselyAdapterConfig {
    /**
     * Database type.
     */
    type?: KyselyDatabaseType
    /**
     * Function to get author by id. If not provided, the author will be null.
     */
    getAuthor?: BlogDataProvider["getAuthor"]
    /**
     * Default locale to use when a method call does not specify one.
     * @default "en"
     */
    defaultLocale?: string
}

import type { ColumnType } from "kysely"
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>
export type Timestamp = ColumnType<Date, Date | string, Date | string>

export const PostStatus = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED"
} as const
export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus]
export type PostTable = {
    id: Generated<string>
    authorId: string | null
    defaultLocale: Generated<string>
    title: string
    slug: string
    excerpt: string
    content: string
    image: string | null
    version: Generated<number>
    status: Generated<PostStatus>
    createdAt: Generated<Timestamp>
    updatedAt: Timestamp
}
export type PostI18nTable = {
    id: Generated<string>
    postId: string
    locale: string
    title: string
    slug: string
    excerpt: string
    content: string
}
export type PostTagTable = {
    postId: string
    tagId: string
}
export type TagTable = {
    id: Generated<string>
    defaultLocale: Generated<string>
    name: string
    slug: string
    createdAt: Generated<Timestamp>
    updatedAt: Timestamp
}
export type TagI18nTable = {
    id: Generated<string>
    tagId: string
    locale: string
    name: string
    slug: string
}
export type DBSchema = {
    Post: PostTable
    PostI18n: PostI18nTable
    PostTag: PostTagTable
    Tag: TagTable
    TagI18n: TagI18nTable
}

export const kyselyAdapter = (
    db: Kysely<DBSchema>,
    config?: KyselyAdapterConfig
) => {
    const providerDefaultLocale = config?.defaultLocale ?? "en"

    async function fetchOneBySlug(theSlug: string, locale: string) {
        const rows = await db
            .selectFrom("Post as p")
            .leftJoin("PostI18n as pi", (join) =>
                join.onRef("pi.postId", "=", "p.id").on("pi.locale", "=", locale),
            )
            .select((eb) => [
                "p.id as id",
                "p.authorId as authorId",
                "p.defaultLocale as defaultLocale",
                "p.createdAt as createdAt",
                "p.updatedAt as updatedAt",
                "p.status as status",
                "p.image as image",
                sql<string>`coalesce(${eb.ref("pi.title")}, ${eb.ref("p.title")})`.as(
                    "title",
                ),
                sql<string>`coalesce(${eb.ref("pi.slug")}, ${eb.ref("p.slug")})`.as(
                    "slug",
                ),
                sql<string>`coalesce(${eb.ref("pi.excerpt")}, ${eb.ref(
                    "p.excerpt",
                )})`.as("excerpt"),
                sql<string>`coalesce(${eb.ref("pi.content")}, ${eb.ref(
                    "p.content",
                )})`.as("content"),
            ])
            .where((eb) => eb.or([eb("pi.slug", "=", theSlug), eb("p.slug", "=", theSlug)]))
            .limit(1)
            .execute()

        const row = rows[0]
        if (!row) return null

        const tagRows = await db
            .selectFrom("PostTag as pt")
            .innerJoin("Tag as t", "t.id", "pt.tagId")
            .leftJoin("TagI18n as ti", (join) =>
                join.onRef("ti.tagId", "=", "t.id").on("ti.locale", "=", locale),
            )
            .select((eb) => [
                "pt.postId as postId",
                "t.id as id",
                sql<string>`coalesce(${eb.ref("ti.name")}, ${eb.ref("t.name")})`.as(
                    "name",
                ),
                sql<string>`coalesce(${eb.ref("ti.slug")}, ${eb.ref("t.slug")})`.as(
                    "slug",
                ),
            ])
            .where("pt.postId", "=", row.id)
            .execute()

        const getAuthor = config?.getAuthor
        const isPublished = row.status === PostStatus.PUBLISHED
        const author =
            (row.authorId && getAuthor ? await getAuthor(row.authorId) : null) ?? {
                id: row.authorId ?? "",
                name: "Unknown",
            }

        return {
            id: row.id,
            slug: row.slug,
            title: row.title,
            content: row.content,
            excerpt: row.excerpt,
            image: row.image ?? undefined,
            published: isPublished,
            publishedAt: isPublished ? (row.updatedAt as Date) : undefined,
            tags: tagRows.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
            createdAt: row.createdAt as Date,
            updatedAt: row.updatedAt as Date,
            author,
        }
    }

    const providerFunction = (): BlogDataProvider => ({
        getAllPosts: async ({
            slug,
            tag,
            offset,
            limit,
            query,
            published,
            locale = providerDefaultLocale
        } = {}) => {
            const lowerQuery = (query ?? "").toLowerCase().trim()

            // Base select with locale-aware fields via PostI18n
            let baseQuery = db
                .selectFrom("Post as p")
                .leftJoin("PostI18n as pi", (join) =>
                    join
                        .onRef("pi.postId", "=", "p.id")
                        .on("pi.locale", "=", locale)
                )
                .select((eb) => [
                    "p.id as id",
                    "p.authorId as authorId",
                    "p.defaultLocale as defaultLocale",
                    "p.createdAt as createdAt",
                    "p.updatedAt as updatedAt",
                    "p.status as status",
                    "p.image as image",
                    sql<string>`coalesce(${eb.ref("pi.title")}, ${eb.ref(
                        "p.title",
                    )})`.as("title"),
                    sql<string>`coalesce(${eb.ref("pi.slug")}, ${eb.ref(
                        "p.slug",
                    )})`.as("slug"),
                    sql<string>`coalesce(${eb.ref("pi.excerpt")}, ${eb.ref(
                        "p.excerpt",
                    )})`.as("excerpt"),
                    sql<string>`coalesce(${eb.ref("pi.content")}, ${eb.ref(
                        "p.content",
                    )})`.as("content"),
                ])
                .orderBy("p.createdAt", "desc")

            if (slug) {
                baseQuery = baseQuery.where((eb) =>
                    eb.or([
                        eb("pi.slug", "=", slug),
                        eb("p.slug", "=", slug),
                    ]),
                )
            }

            if (typeof published === "boolean") {
                baseQuery = baseQuery.where(
                    "p.status",
                    "=",
                    published ? PostStatus.PUBLISHED : PostStatus.DRAFT,
                )
            }

            if (tag) {
                baseQuery = baseQuery
                    .innerJoin("PostTag as pt", "pt.postId", "p.id")
                    .innerJoin("Tag as t", "t.id", "pt.tagId")
                    .leftJoin("TagI18n as ti_match", (join) =>
                        join
                            .onRef("ti_match.tagId", "=", "t.id")
                            .on("ti_match.locale", "=", locale),
                    )
                    // Match localized tag slug first, then fallback to base slug or name
                    .where((eb) =>
                        eb.or([
                            eb("ti_match.slug", "=", tag),
                            eb("t.slug", "=", tag),
                            eb("t.name", "=", tag),
                        ]),
                    )
            }

            if (lowerQuery.length > 0) {
                const like = `%${lowerQuery}%`
                baseQuery = baseQuery.where((eb) =>
                    eb.or([
                        eb(
                            sql`lower(coalesce(${eb.ref("pi.title")}, ${eb.ref(
                                "p.title",
                            )}))`,
                            "like",
                            like,
                        ),
                        eb(
                            sql`lower(coalesce(${eb.ref(
                                "pi.excerpt",
                            )}, ${eb.ref("p.excerpt")}))`,
                            "like",
                            like,
                        ),
                        eb(
                            sql`lower(coalesce(${eb.ref(
                                "pi.content",
                            )}, ${eb.ref("p.content")}))`,
                            "like",
                            like,
                        ),
                    ]),
                )
            }

            if (typeof offset === "number" && offset > 0) {
                baseQuery = baseQuery.offset(offset)
            }
            if (typeof limit === "number") {
                baseQuery = baseQuery.limit(limit)
            }

            const rows = await baseQuery.execute()

            if (rows.length === 0) return []

            const postIds = rows.map((r) => r.id)

            // Fetch tags for all posts in batch
            const tagRows = await db
                .selectFrom("PostTag as pt")
                .innerJoin("Tag as t", "t.id", "pt.tagId")
                .leftJoin("TagI18n as ti", (join) =>
                    join
                        .onRef("ti.tagId", "=", "t.id")
                        .on("ti.locale", "=", locale),
                )
                .select((eb) => [
                    "pt.postId as postId",
                    "t.id as id",
                    sql<string>`coalesce(${eb.ref("ti.name")}, ${eb.ref(
                        "t.name",
                    )})`.as("name"),
                    sql<string>`coalesce(${eb.ref("ti.slug")}, ${eb.ref(
                        "t.slug",
                    )})`.as("slug"),
                ])
                .where("pt.postId", "in", postIds)
                .execute()

            const postIdToTags = new Map<string, { id: string; name: string; slug: string }[]>()
            for (const tr of tagRows) {
                const list = postIdToTags.get(tr.postId) ?? []
                list.push({ id: tr.id, name: tr.name, slug: tr.slug })
                postIdToTags.set(tr.postId, list)
            }

            // Attach author details if provided
            const getAuthor = config?.getAuthor

            const posts = await Promise.all(
                rows.map(async (r) => {
                    const isPublished = r.status === PostStatus.PUBLISHED
                    const author =
                        (r.authorId && getAuthor ? await getAuthor(r.authorId) : null) ?? {
                            id: r.authorId ?? "",
                            name: "Unknown",
                        }
                    return {
                        id: r.id,
                        slug: r.slug,
                        title: r.title,
                        content: r.content,
                        excerpt: r.excerpt,
                        image: r.image ?? undefined,
                        published: isPublished,
                        publishedAt: isPublished ? (r.updatedAt as Date) : undefined,
                        tags: postIdToTags.get(r.id) ?? [],
                        createdAt: r.createdAt as Date,
                        updatedAt: r.updatedAt as Date,
                        author,
                    }
                }),
            )

            return posts
        },

        getPostBySlug: async (theSlug: string, options) => {
            const loc = options?.locale ?? providerDefaultLocale
            const post = await fetchOneBySlug(theSlug, loc)
            return post ?? null
        },

        createPost: async (input) => {
            const now = new Date()
            const baseSlug = (input.slug && input.slug.trim().length > 0)
                ? input.slug
                : slugify(input.title)

            await db.transaction().execute(async (trx) => {
                const inserted = await trx
                    .insertInto("Post")
                    .values({
                        authorId: input.authorId ?? null,
                        defaultLocale: "en",
                        title: input.title,
                        slug: baseSlug,
                        excerpt: input.excerpt ?? "",
                        content: input.content,
                        image: input.image ?? null,
                        status: (input.published ?? false)
                            ? PostStatus.PUBLISHED
                            : PostStatus.DRAFT,
                        updatedAt: now,
                    })
                    .returning(["id"]) // supported on PG; ignored on some dialects
                    .executeTakeFirst()

                const postId = inserted?.id
                    ?? (await trx
                        .selectFrom("Post")
                        .select(["id"])
                        .where("slug", "=", baseSlug)
                        .executeTakeFirst())?.id
                if (!postId) {
                    throw new Error("Failed to resolve created post id")
                }

                // Handle tags if provided (string names or connectOrCreate)
                const maybeTags = (input as unknown as {
                    tags?: Array<
                        string | { tag?: { connectOrCreate?: { where?: { name?: string }; create?: { name?: string; slug?: string } } } }
                    >
                }).tags

                if (Array.isArray(maybeTags) && maybeTags.length > 0) {
                    for (const item of maybeTags) {
                        const tagName = typeof item === "string"
                            ? item
                            : item?.tag?.connectOrCreate?.create?.name
                        if (!tagName) continue
                        const tagSlug = slugify(tagName)

                        // Try find existing tag by slug
                        let tag = await trx
                            .selectFrom("Tag")
                            .select(["id", "slug", "name"]) // keep minimal
                            .where("slug", "=", tagSlug)
                            .executeTakeFirst()

                        if (!tag) {
                            const insertedTag = await trx
                                .insertInto("Tag")
                                .values({
                                    defaultLocale: "en",
                                    name: tagName,
                                    slug: tagSlug,
                                    updatedAt: now,
                                })
                                .returning(["id"]) // supported on PG; ignored on some dialects
                                .executeTakeFirst()

                            const tagId = insertedTag?.id
                                ?? (await trx
                                    .selectFrom("Tag")
                                    .select(["id"])
                                    .where("slug", "=", tagSlug)
                                    .executeTakeFirst())?.id
                            if (!tagId) {
                                throw new Error("Failed to resolve created tag id")
                            }
                            tag = { id: tagId, name: tagName, slug: tagSlug }
                        }

                        // Connect
                        await trx
                            .insertInto("PostTag")
                            .values({ postId, tagId: tag.id })
                            .execute()
                    }
                }
            })

            // Return the freshly created post via the normal path
            const created = await fetchOneBySlug(baseSlug, "en")
            if (!created) throw new Error("Failed to create post")
            return created
        },

        updatePost: async (slug, input) => {
            const now = new Date()

            return await db.transaction().execute(async (trx) => {
                const existing = await trx
                    .selectFrom("Post")
                    .selectAll()
                    .where("slug", "=", slug)
                    .executeTakeFirst()

                if (!existing) {
                    throw new Error("Post not found")
                }

                const nextSlug = input.slug ?? existing.slug
                const nextStatus =
                    typeof input.published === "boolean"
                        ? input.published
                            ? PostStatus.PUBLISHED
                            : PostStatus.DRAFT
                        : existing.status

                await trx
                    .updateTable("Post")
                    .set({
                        title: input.title,
                        content: input.content,
                        excerpt: input.excerpt ?? existing.excerpt,
                        slug: nextSlug,
                        image: input.image ?? existing.image,
                        status: nextStatus,
                        updatedAt: now,
                        version: (existing.version ?? 1) + 1,
                    })
                    .where("id", "=", existing.id)
                    .execute()

                // Handle tags reset/create when provided
                const tagOps = (input as unknown as {
                    tags?: {
                        deleteMany?: Record<string, never>
                        create?: Array<{ tag?: { connectOrCreate?: { create?: { name?: string; slug?: string } } } }>
                    }
                }).tags

                if (tagOps) {
                    if (tagOps.deleteMany) {
                        await trx
                            .deleteFrom("PostTag")
                            .where("postId", "=", existing.id)
                            .execute()
                    }

                    if (Array.isArray(tagOps.create) && tagOps.create.length > 0) {
                        for (const c of tagOps.create) {
                            const tagName = c?.tag?.connectOrCreate?.create?.name
                            if (!tagName) continue
                            const tagSlug = slugify(tagName)
                            let tag = await trx
                                .selectFrom("Tag")
                                .select(["id", "name", "slug"]) 
                                .where("slug", "=", tagSlug)
                                .executeTakeFirst()
                            if (!tag) {
                                const insertedTag = await trx
                                    .insertInto("Tag")
                                    .values({
                                        defaultLocale: "en",
                                        name: tagName,
                                        slug: tagSlug,
                                        updatedAt: now,
                                    })
                                    .returning(["id"]) // supported on PG; ignored on some dialects
                                    .executeTakeFirst()
                                const tagId = insertedTag?.id
                                    ?? (await trx
                                        .selectFrom("Tag")
                                        .select(["id"])
                                        .where("slug", "=", tagSlug)
                                        .executeTakeFirst())?.id
                                if (!tagId) {
                                    throw new Error("Failed to resolve created tag id")
                                }
                                tag = { id: tagId, name: tagName, slug: tagSlug }
                            }
                            await trx
                                .insertInto("PostTag")
                                .values({ postId: existing.id, tagId: tag.id })
                                .execute()
                        }
                    }
                }

                const updated = await fetchOneBySlug(nextSlug, "en")
                if (!updated) throw new Error("Failed to update post")
                return updated
            })
        },

        deletePost: async (slug) => {
            await db.transaction().execute(async (trx) => {
                const p = await trx
                    .selectFrom("Post")
                    .select(["id"])
                    .where("slug", "=", slug)
                    .executeTakeFirst()
                if (!p) return

                await trx
                    .deleteFrom("PostTag")
                    .where("postId", "=", p.id)
                    .execute()
                await trx
                    .deleteFrom("PostI18n")
                    .where("postId", "=", p.id)
                    .execute()
                await trx
                    .deleteFrom("Post")
                    .where("id", "=", p.id)
                    .execute()
            })
        }
    })
    return providerFunction
}
