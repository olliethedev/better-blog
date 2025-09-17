import { DEFAULT_LOCALE } from "@/lib/constants"
import { normalizeBasePath, normalizeBaseURL } from "@/lib/utils"
import type { BlogDataProvider, Post } from "@/types"
import { createClient } from "better-call/client"
import type { BlogApiRoutes } from "../../api/api"
import {
    PostSerializedArraySchema,
    PostSerializedSchema
} from "../../schema/post"
import type {
    PostCreateExtendedInput,
    PostUpdateExtendedInput
} from "../../schema/post"
import type { CreateApiBlogProviderOptions } from "./types"

export function createBlogApiProvider(
    options: CreateApiBlogProviderOptions
): BlogDataProvider {
    const { baseURL, basePath, createClientImpl } = options ?? {}
    const normalizedBaseURL = baseURL ? normalizeBaseURL(baseURL) : ""
    const normalizedBasePath = normalizeBasePath(basePath)

    // if baseURL is not provided the apiPath is just the basePath, that means the api is on the same domain
    const apiPath = normalizedBaseURL + normalizedBasePath
    const clientFactory = createClientImpl ?? createClient
    const client = clientFactory<BlogApiRoutes>({
        baseURL: apiPath
    })
    const providerDefaultLocale = options?.defaultLocale ?? DEFAULT_LOCALE

    function unwrapData<T>(response: unknown): T {
        // Many HTTP clients return `{ data, status, headers }`.
        // Support both raw body and wrapped `{ data }` shapes.
        if (
            response &&
            typeof response === "object" &&
            Object.prototype.hasOwnProperty.call(
                response as Record<string, unknown>,
                "data"
            )
        ) {
            return (response as { data: T }).data
        }
        return response as T
    }
    return {
        async getAllPosts(filter) {
            const res = await client("/posts", {
                method: "GET",
                query: {
                    ...(filter ?? {}),
                    locale: filter?.locale ?? providerDefaultLocale
                }
            })
            console.log("res", res)
            const parsed = PostSerializedArraySchema.parse(unwrapData(res))
            return parsed.map((p) => revivePost(p))
        },

        async getPostBySlug(slug: string, options?: { locale?: string }) {
            const res = await client("/posts/:slug", {
                method: "GET",
                params: { slug },
                query: { locale: options?.locale ?? providerDefaultLocale }
            })
            const body = unwrapData<unknown | null>(res)
            const parsed = body ? PostSerializedSchema.parse(body) : null
            return parsed ? revivePost(parsed) : null
        },

        async createPost(input: PostCreateExtendedInput) {
            const res = await client("@post/posts", {
                method: "POST",
                body: input
            })
            const parsed = PostSerializedSchema.parse(unwrapData(res))
            return revivePost(parsed)
        },

        async updatePost(slug: string, input: PostUpdateExtendedInput) {
            const res = await client("@put/posts/:slug", {
                method: "PUT",
                params: { slug },
                body: input
            })
            const parsed = PostSerializedSchema.parse(unwrapData(res))
            return revivePost(parsed)
        },

        async deletePost(slug: string) {
            await client("@delete/posts/:slug", {
                method: "DELETE",
                params: { slug }
            })
        }
    }
}

function revivePost(raw: ReturnType<typeof PostSerializedSchema.parse>): Post {
    const r = raw
    const created = r.createdAt ? new Date(r.createdAt) : new Date()
    const updated = r.updatedAt ? new Date(r.updatedAt) : created
    const published = r.publishedAt ? new Date(r.publishedAt) : undefined
    return {
        ...(r as Omit<Post, "createdAt" | "updatedAt" | "publishedAt">),
        createdAt: created,
        updatedAt: updated,
        publishedAt: published
    }
}
