import type { inferQueryKeyStore } from "@lukemorales/query-key-factory"
import type { createBlogQueryKeys } from "./create-query-keys"

export interface PostsListParams {
    tag?: string
    query?: string
    limit?: number
    published?: boolean
}

export interface DraftsListParams {
    limit?: number
}

export type QueryKeys = inferQueryKeyStore<
    ReturnType<typeof createBlogQueryKeys>
>
