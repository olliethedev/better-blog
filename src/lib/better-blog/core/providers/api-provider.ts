import { createClient } from "better-call/client"
import type { BlogApiRoutes } from "../../server/api"
import type { BlogDataProvider, Post, PostCreateInput, PostUpdateInput } from "../types"

export interface CreateApiBlogProviderOptions {
    /** Base URL including router basePath, e.g. "/api/blog" (default) */
    baseURL?: string
}

export function createApiBlogProvider(
    options?: CreateApiBlogProviderOptions
): BlogDataProvider {
    const rawClient = createClient<BlogApiRoutes>({
        baseURL: options?.baseURL ?? "/api/blog"
    })
    const client = rawClient as unknown as (
        path: string,
        options?: Record<string, unknown>
    ) => Promise<unknown>

    return {
        async getAllPosts(filter) {
            const res = (await client("/posts", {
                method: "GET",
                query: filter ?? {}
            })) as unknown as Post[]
            return res
        },

        async getPostBySlug(slug: string) {
            const res = (await client("/posts/:slug", {
                method: "GET",
                params: { slug }
            })) as unknown as Post | null
            return res ?? null
        },

        async createPost(input: PostCreateInput) {
            const res = (await client("/posts", {
                method: "POST",
                body: input
            })) as unknown as Post
            return res
        },

        async updatePost(slug: string, input: PostUpdateInput) {
            const res = (await client("/posts/:slug", {
                method: "PUT",
                params: { slug },
                body: input
            })) as unknown as Post
            return res
        },

        async deletePost(slug: string) {
            await client("/posts/:slug", {
                method: "DELETE",
                params: { slug }
            })
        }
    }
}


