import type { BlogDataProvider } from "@/types"
import { mergeQueryKeys } from "@lukemorales/query-key-factory"
import { createDraftsQueries } from "./drafts"
import { createPostsQueries } from "./posts"
import { createTagsQueries } from "./tags"

export function createBlogQueryKeys(provider: BlogDataProvider) {
    const posts = createPostsQueries(provider)
    const tags = createTagsQueries(provider)
    const drafts = createDraftsQueries(provider)

    return mergeQueryKeys(posts, tags, drafts)
}
