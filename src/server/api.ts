import { DEFAULT_API_BASE_PATH } from "@/lib/constants"
import type { Post } from "@/types"
import type { BlogDataProvider } from "@/types"
import { createEndpoint, createRouter } from "better-call"
import { z } from "zod"
import {
    PostCreateSchema,
    PostListQuerySchema,
    PostUpdateSchema
} from "../schema/post"

const listPostsQuerySchema = PostListQuerySchema

export interface RouterOpenAPIOptions {
    disabled?: boolean
    path?: string
    scalar?: {
        title?: string
        version?: string
        description?: string
        theme?: string
    }
}

export interface BlogApiRouterOptions {
    basePath?: string
    /**
     * Expose OpenAPI UI; disabled by default to avoid leaking routes by accident.
     * Pass-through to better-call's router openapi config.
     */
    openapi?: RouterOpenAPIOptions
}

export interface CreateBlogApiRouterOptions extends BlogApiRouterOptions {
    provider: BlogDataProvider
}

export function createBlogApiRouter(options: CreateBlogApiRouterOptions) {
    const { provider } = options
    const listPosts = createEndpoint(
        "/posts",
        {
            method: "GET",
            query: listPostsQuerySchema
        },
        async (ctx) => {
            const posts = (await provider.getAllPosts?.(ctx.query)) ?? []
            return posts
        }
    )

    const getPost = createEndpoint(
        "/posts/:slug",
        {
            method: "GET",
            query: z.object({
                locale: z.string().optional()
            })
        },
        async (ctx) => {
            const slug = ctx.params.slug
            if (!slug) {
                throw ctx.error(400, { message: "slug is required" })
            }
            const post: Post | null =
                (await provider.getPostBySlug?.(slug, {
                    locale: ctx.query?.locale
                })) ??
                (
                    await provider.getAllPosts?.({
                        slug,
                        locale: ctx.query?.locale
                    })
                )?.find((p) => p.slug === slug) ??
                null
            if (!post) {
                throw ctx.error(404, { message: "Post not found" })
            }
            return post
        }
    )

    const createPost = createEndpoint(
        "/posts",
        {
            method: "POST",
            body: PostCreateSchema
        },
        async (ctx) => {
            if (!provider.createPost) {
                throw ctx.error(501, {
                    message: "createPost is not implemented"
                })
            }
            const post = await provider.createPost(ctx.body)
            return post
        }
    )

    const updatePost = createEndpoint(
        "/posts/:slug",
        {
            method: "PUT",
            body: PostUpdateSchema
        },
        async (ctx) => {
            const slug = ctx.params.slug
            if (!slug) {
                throw ctx.error(400, { message: "slug is required" })
            }
            if (!provider.updatePost) {
                throw ctx.error(501, {
                    message: "updatePost is not implemented"
                })
            }
            const post = await provider.updatePost(slug, ctx.body)
            return post
        }
    )

    const deletePost = createEndpoint(
        "/posts/:slug",
        {
            method: "DELETE"
        },
        async (ctx) => {
            const slug = ctx.params.slug
            if (!slug) {
                throw ctx.error(400, { message: "slug is required" })
            }
            if (!provider.deletePost) {
                throw ctx.error(501, {
                    message: "deletePost is not implemented"
                })
            }
            await provider.deletePost(slug)
            return { ok: true as const }
        }
    )

    const router = createRouter(
        {
            listPosts,
            getPost,
            createPost,
            updatePost,
            deletePost
        },
        {
            basePath: options.basePath ?? DEFAULT_API_BASE_PATH,
            openapi: options.openapi
        }
    )

    return router
}

export type BlogApiRoutes = ReturnType<typeof createBlogApiRouter>
