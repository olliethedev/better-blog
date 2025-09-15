import { DEFAULT_LOCALE } from "@/lib/constants"
import type { BlogDataProvider } from "@/types"
import type { PostCreateExtendedInput, PostUpdateExtendedInput } from "../../schema/post"
import type { DrizzleProviderOptions } from "./types"



// biome-ignore lint/suspicious/noExplicitAny: external type
type AnyDb = any

// Minimal row shapes we select
interface SelectPostRow {
    id: string
    authorId: string | null
    defaultLocale: string
    createdAt: unknown
    updatedAt: unknown
    status: string
    image: string | null
    title: string
    slug: string
    excerpt: string
    content: string
}
interface SelectTagRow {
    postId?: string
    postid?: string
    id: string
    name: string
    slug: string
}

export async function createDrizzleProvider(
    options: DrizzleProviderOptions
): Promise<BlogDataProvider> {
    const {
        drizzle: drizzleClient,
        defaultLocale: providerDefaultLocale = DEFAULT_LOCALE,
        getAuthor
    } = options
    const drizzle = drizzleClient as unknown as AnyDb
    // Prefer consumer-provided drizzle `sql` 
    // biome-ignore lint/suspicious/noExplicitAny: external type
    const SQLTag = (options as any).sql as any

    async function fetchOneBySlug(theSlug: string, locale: string) {
        // Base post with locale-aware fields via PostI18n
        const postRows = await drizzle.execute(SQLTag`
                select
                  p.id,
                  p."authorId",
                  p."defaultLocale",
                  p."createdAt",
                  p."updatedAt",
                  p.status,
                  p.image,
                  coalesce(pi.title, p.title) as title,
                  coalesce(pi.slug, p.slug) as slug,
                  coalesce(pi.excerpt, p.excerpt) as excerpt,
                  coalesce(pi.content, p.content) as content
                from "Post" p
                left join "PostI18n" pi
                  on pi."postId" = p.id and pi.locale = ${locale}
                where (pi.slug = ${theSlug} or p.slug = ${theSlug})
                limit 1
            `)

        const row = firstRowFromExecute<SelectPostRow>(postRows)
        if (!row) return null

        const tagRows = await drizzle.execute(SQLTag`
            select
              pt."postId" as "postId",
              t.id as id,
              coalesce(ti.name, t.name) as name,
              coalesce(ti.slug, t.slug) as slug
            from "PostTag" pt
            inner join "Tag" t on t.id = pt."tagId"
            left join "TagI18n" ti on ti."tagId" = t.id and ti.locale = ${locale}
            where pt."postId" = ${row.id}
        `)

        const tagsArray = rowsFromExecute<SelectTagRow>(tagRows)
        const isPublished = row.status === "PUBLISHED"

        const author = (row.authorId && getAuthor
            ? await getAuthor(row.authorId as string)
            : null) ?? {
            id: row.authorId ?? "",
            name: "Unknown"
        }

        const createdAt = coerceDate(row.createdAt)
        const updatedAt = coerceDate(row.updatedAt)

        return {
            authorId: (row.authorId as string | null) ?? undefined,
            id: row.id as string,
            slug: row.slug as string,
            title: row.title as string,
            content: row.content as string,
            excerpt: row.excerpt as string,
            image: (row.image as string | null) ?? undefined,
            published: isPublished,
            publishedAt: isPublished ? updatedAt : undefined,
            tags: tagsArray.map((t) => ({
                id: t.id as string,
                name: t.name as string,
                slug: t.slug as string
            })),
            createdAt,
            updatedAt,
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
        } = {}) => {
            const lowerQuery = (query ?? "").toLowerCase().trim()

            // Build dynamic SQL conditions
            const whereParts: unknown[] = []
            if (slug) {
                whereParts.push(SQLTag`(pi.slug = ${slug} or p.slug = ${slug})`)
            }
            if (typeof published === "boolean") {
                whereParts.push(
                    SQLTag`p.status = ${published ? "PUBLISHED" : "DRAFT"}`
                )
            }
            if (tag) {
                // Join tag tables and filter by localized slug first then base slug/name
                whereParts.push(SQLTag`(
                    lower(coalesce(ti_match.slug, '')) = lower(${tag}) or
                    lower(t.slug) = lower(${tag}) or
                    lower(t.name) = lower(${tag})
                )`)
            }
            if (lowerQuery.length > 0) {
                const like = `%${lowerQuery}%`
                whereParts.push(SQLTag`(
                    lower(coalesce(pi.title, p.title)) like ${like} or
                    lower(coalesce(pi.excerpt, p.excerpt)) like ${like} or
                    lower(coalesce(pi.content, p.content)) like ${like}
                )`)
            }

            const hasTagFilter = Boolean(tag)

            const baseSQL = SQLTag`
                select
                  p.id,
                  p."authorId",
                  p."defaultLocale",
                  p."createdAt",
                  p."updatedAt",
                  p.status,
                  p.image,
                  coalesce(pi.title, p.title) as title,
                  coalesce(pi.slug, p.slug) as slug,
                  coalesce(pi.excerpt, p.excerpt) as excerpt,
                  coalesce(pi.content, p.content) as content
                from "Post" p
                ${
                    hasTagFilter
                        ? SQLTag`
                    inner join "PostTag" pt on pt."postId" = p.id
                    inner join "Tag" t on t.id = pt."tagId"
                    left join "TagI18n" ti_match on ti_match."tagId" = t.id and ti_match.locale = ${locale}
                `
                        : SQLTag``
                }
                left join "PostI18n" pi on pi."postId" = p.id and pi.locale = ${locale}
                ${whereParts.length > 0 ? SQLTag`where ${SQLTag.join(whereParts, SQLTag` and `)}` : SQLTag``}
                order by p."createdAt" desc
                ${typeof limit === "number" ? SQLTag`limit ${limit}` : SQLTag``}
                ${typeof offset === "number" && offset > 0 ? SQLTag`offset ${offset}` : SQLTag``}
            `

            const rowsRes = await drizzle.execute(baseSQL)
            const rows = rowsFromExecute<SelectPostRow>(rowsRes)
            if (!rows || rows.length === 0) return []

            const ids = rows.map((r) => r.id)
            // Build a disjunction for ids to avoid driver-specific array handling
            const idConds: unknown[] = ids.map((id) => SQLTag`pt."postId" = ${id}`)
            const tagRowsRes = await drizzle.execute(SQLTag`
                select
                  pt."postId" as "postId",
                  t.id as id,
                  coalesce(ti.name, t.name) as name,
                  coalesce(ti.slug, t.slug) as slug
                from "PostTag" pt
                inner join "Tag" t on t.id = pt."tagId"
                left join "TagI18n" ti on ti."tagId" = t.id and ti.locale = ${locale}
                ${ids.length > 0 ? SQLTag`where ${SQLTag.join(idConds, SQLTag` or `)}` : SQLTag``}
            `)
            const tagRows = rowsFromExecute<SelectTagRow>(tagRowsRes)
            const map = new Map<
                string,
                { id: string; name: string; slug: string }[]
            >()
            for (const tr of tagRows) {
                const key = (tr.postid ?? tr.postId) as string
                const list = map.get(key) ?? []
                list.push({ id: tr.id, name: tr.name, slug: tr.slug })
                map.set(key, list)
            }

            const posts = await Promise.all(
                rows.map(async (r) => {
                    const isPublished = r.status === "PUBLISHED"
                    const author = (r.authorId && getAuthor
                        ? await getAuthor(r.authorId as string)
                        : null) ?? {
                        id: r.authorId ?? "",
                        name: "Unknown"
                    }
                    const createdAt = coerceDate(r.createdAt)
                    const updatedAt = coerceDate(r.updatedAt)
                    return {
                        authorId: (r.authorId as string | null) ?? undefined,
                        id: r.id as string,
                        slug: r.slug as string,
                        title: r.title as string,
                        content: r.content as string,
                        excerpt: r.excerpt as string,
                        image: (r.image as string | null) ?? undefined,
                        published: isPublished,
                        publishedAt: isPublished ? updatedAt : undefined,
                        tags: map.get(r.id) ?? [],
                        createdAt,
                        updatedAt,
                        author
                    }
                })
            )

            return posts
        },

        getPostBySlug: async (
            theSlug: string,
            options?: { locale?: string }
        ) => {
            const loc = options?.locale ?? providerDefaultLocale
            const post = await fetchOneBySlug(theSlug, loc)
            return post ?? null
        },

        createPost: async (input: PostCreateExtendedInput) => {
            const title = input.title
            const { slug } = input as unknown as { slug?: string }
            const baseSlug =
                slug && slug.trim().length > 0
                    ? slug
                    : (await import("@/lib/format-utils")).slugify(title)

            // Transaction using drizzle
            // Some drizzle drivers expose .transaction(cb), others .transaction(async (tx) => {})
            // Use a generic approach: prefer function form with callback
            await drizzle.transaction(async (tx: AnyDb) => {
                const createdAt = input.createdAt ?? null
                const updatedAt = input.updatedAt ?? null
                // Insert post
                const insertRes = await tx.execute(SQLTag`
                    insert into "Post" (
                        "authorId", "defaultLocale", title, slug, excerpt, content, image, status, "createdAt", "updatedAt"
                    ) values (
                        ${input.authorId ?? null}, ${DEFAULT_LOCALE}, ${input.title}, ${baseSlug}, ${input.excerpt ?? ""}, ${input.content}, ${input.image ?? null}, ${input.published ? "PUBLISHED" : "DRAFT"}, ${createdAt ? SQLTag`${createdAt}` : SQLTag`now()`}, ${updatedAt ? SQLTag`${updatedAt}` : SQLTag`now()`}
                    ) returning id
                `)
                const inserted = firstRowFromExecute<{ id: string }>(insertRes)

                let postId: string | undefined = inserted?.id
                if (!postId) {
                    const fetched = await tx.execute(SQLTag`
                        select id from "Post" where slug = ${baseSlug} limit 1
                    `)
                    const fr = firstRowFromExecute<{ id: string }>(fetched)
                    postId = fr?.id as string | undefined
                }
                if (!postId)
                    throw new Error("Failed to resolve created post id")

                const maybeTags = (
                    input as unknown as {
                        tags?: Array<
                            | string
                            | {
                                  tag?: {
                                      connectOrCreate?: {
                                          where?: { name?: string }
                                          create?: {
                                              name?: string
                                              slug?: string
                                          }
                                      }
                                  }
                              }
                        >
                    }
                ).tags

                if (Array.isArray(maybeTags) && maybeTags.length > 0) {
                    const { slugify } = await import("@/lib/format-utils")
                    for (const item of maybeTags) {
                        const tagName =
                            typeof item === "string"
                                ? item
                                : item?.tag?.connectOrCreate?.create?.name
                        if (!tagName) continue
                        const tagSlug = slugify(tagName)

                        // Find or create tag
                        const tagRowRes = await tx.execute(
                            SQLTag`select id from "Tag" where slug = ${tagSlug} limit 1`
                        )
                        let tagRow = firstRowFromExecute<{ id: string }>(tagRowRes)
                        if (!tagRow) {
                            const insTagRes = await tx.execute(SQLTag`
                                insert into "Tag" ("defaultLocale", name, slug, "updatedAt")
                                values (${DEFAULT_LOCALE}, ${tagName}, ${tagSlug}, now())
                                returning id
                            `)
                            tagRow = firstRowFromExecute<{ id: string }>(insTagRes)
                            if (!tagRow?.id) {
                                const fallback = await tx.execute(
                                    SQLTag`select id from "Tag" where slug = ${tagSlug} limit 1`
                                )
                                const fb = firstRowFromExecute<{ id: string }>(fallback)
                                if (!fb?.id)
                                    throw new Error(
                                        "Failed to resolve created tag id"
                                    )
                                tagRow = fb
                            }
                        }

                        await tx.execute(SQLTag`
                            insert into "PostTag" ("postId", "tagId") values (${postId}, ${tagRow.id})
                            on conflict ("postId", "tagId") do nothing
                        `)
                    }
                }
            })

            const post = await fetchOneBySlug(baseSlug, DEFAULT_LOCALE)
            if (!post) throw new Error("Failed to create post")
            return post
        },

        updatePost: async (slug: string, input: PostUpdateExtendedInput) => {
            const nextSlug = await drizzle.transaction(async (tx: AnyDb) => {
                const existingRes = await tx.execute(
                    SQLTag`select * from "Post" where slug = ${slug} limit 1`
                )
                const existing = firstRowFromExecute<{
                    id: string
                    slug: string
                    excerpt: string
                    image: string | null
                    status: string
                    version?: number
                }>(existingRes)
                if (!existing) throw new Error("Post not found")

                const computedNextSlug = input.slug ?? existing.slug
                const nextStatus =
                    typeof input.published === "boolean"
                        ? input.published
                            ? "PUBLISHED"
                            : "DRAFT"
                        : existing.status

                const updatedAt = input.updatedAt ?? null
                await tx.execute(SQLTag`
                    update "Post" set
                      title = ${input.title},
                      content = ${input.content},
                      excerpt = ${input.excerpt ?? existing.excerpt},
                      slug = ${computedNextSlug},
                      image = ${input.image ?? existing.image},
                      status = ${nextStatus},
                      "updatedAt" = ${updatedAt ? SQLTag`${updatedAt}` : SQLTag`now()`},
                      version = coalesce(version, 1) + 1
                    where id = ${existing.id}
                `)

                const tagOps = (
                    input as unknown as {
                        tags?: {
                            deleteMany?: Record<string, never>
                            create?: Array<
                                | string
                                | {
                                    tag?: {
                                        connectOrCreate?: {
                                            create?: {
                                                name?: string
                                                slug?: string
                                            }
                                        }
                                    }
                                }
                            >
                        }
                    }
                ).tags

                if (tagOps) {
                    if (tagOps.deleteMany) {
                        await tx.execute(
                            SQLTag`delete from "PostTag" where "postId" = ${existing.id}`
                        )
                    }
                    if (
                        Array.isArray(tagOps.create) &&
                        tagOps.create.length > 0
                    ) {
                        const { slugify } = await import("@/lib/format-utils")
                        for (const c of tagOps.create) {
                            const tagName =
                                typeof c === "string"
                                    ? c
                                    : c?.tag?.connectOrCreate?.create?.name
                            if (!tagName) continue
                            const tagSlug = slugify(tagName)

                            const tagRowRes = await tx.execute(
                                SQLTag`select id from "Tag" where slug = ${tagSlug} limit 1`
                            )
                            let tagRow = firstRowFromExecute<{ id: string }>(tagRowRes)
                            if (!tagRow) {
                                const insTagRes = await tx.execute(SQLTag`
                                    insert into "Tag" ("defaultLocale", name, slug, "updatedAt")
                                    values (${DEFAULT_LOCALE}, ${tagName}, ${tagSlug}, now())
                                    returning id
                                `)
                                tagRow = firstRowFromExecute<{ id: string }>(insTagRes)
                                if (!tagRow?.id) {
                                    const fallback = await tx.execute(
                                        SQLTag`select id from "Tag" where slug = ${tagSlug} limit 1`
                                    )
                                    const fb = firstRowFromExecute<{ id: string }>(fallback)
                                    if (!fb?.id)
                                        throw new Error(
                                            "Failed to resolve created tag id"
                                        )
                                    tagRow = fb
                                }
                            }

                            await tx.execute(SQLTag`
                                insert into "PostTag" ("postId", "tagId") values (${existing.id}, ${tagRow.id})
                                on conflict ("postId", "tagId") do nothing
                            `)
                        }
                    }
                }

                return computedNextSlug
            })

            const updated = await fetchOneBySlug(nextSlug, DEFAULT_LOCALE)
            if (!updated) throw new Error("Failed to update post")
            return updated
        },

        deletePost: async (slug: string) => {
            await drizzle.transaction(async (tx: AnyDb) => {
                const pRes = await tx.execute(
                    SQLTag`select id from "Post" where slug = ${slug} limit 1`
                )
                const p = firstRowFromExecute<{ id: string }>(pRes)
                if (!p) return

                await tx.execute(
                    SQLTag`delete from "PostTag" where "postId" = ${p.id}`
                )
                await tx.execute(
                    SQLTag`delete from "PostI18n" where "postId" = ${p.id}`
                )
                await tx.execute(SQLTag`delete from "Post" where id = ${p.id}`)
            })
        }
    }

    return provider
}

// Normalize drizzle.execute return shape into typed rows
function rowsFromExecute<T>(res: unknown): T[] {
    const arr = Array.isArray(res)
        ? (res as unknown[])
        : ((res as { rows?: unknown[] })?.rows ?? [])
    return arr as T[]
}

function firstRowFromExecute<T>(res: unknown): T | undefined {
    return rowsFromExecute<T>(res)[0]
}

function coerceDate(value: unknown): Date {
    if (value instanceof Date) return value
    if (typeof value === "string" || typeof value === "number") {
        const d = new Date(value)
        if (!Number.isNaN(d.getTime())) return d
    }
    // last resort: try stringifying to avoid throwing
    const d = new Date(String(value ?? ""))
    return Number.isNaN(d.getTime()) ? new Date() : d
}
