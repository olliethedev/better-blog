import { createQueryKeys } from "@lukemorales/query-key-factory"
import type { BlogDataProvider } from "../types"

export interface PostsListParams {
    tag?: string
    query?: string
    limit?: number
}

export function createPostsQueries(provider: BlogDataProvider) {
    return createQueryKeys("posts", {
        // Simplified list query - let query-key-factory handle the typing
        list: (params?: PostsListParams) => ({
            queryKey: [
                {
                    // Keep query key stable with explicit fields (including undefined)
                    tag: params?.tag,
                    query:
                        params?.query !== undefined &&
                        params?.query?.trim() === ""
                            ? undefined
                            : params?.query,
                    limit: params?.limit ?? 10,
                    published: true
                }
            ],
            queryFn: async ({ pageParam }: { pageParam?: number }) => {
                return provider.getAllPosts({
                    tag: params?.tag,
                    query: params?.query,
                    offset: pageParam ?? 0,
                    limit: params?.limit ?? 10,
                    published: true
                })
            }
        }),

        // Simplified detail query
        detail: (slug: string) => ({
            queryKey: [slug],
            queryFn: async () => {
                if (!slug) return null

                // Try dedicated method first
                if (provider.getPostBySlug) {
                    const post = await provider.getPostBySlug(slug)
                    if (post) return post
                }

                // Fallback to searching in all posts
                const posts = await provider.getAllPosts({ slug })
                return posts.find((p) => p.slug === slug) ?? null
            }
        })
    })
}
