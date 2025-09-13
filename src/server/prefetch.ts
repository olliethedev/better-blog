// Server-safe prefetch utilities
// NO "use client" directive - can be called from server components

import type { QueryClient } from '@tanstack/react-query';
import type { BlogDataProvider, RouteMatch } from "../core/types"
import { createBlogQueryKeys } from "../queries"

export async function prefetchBlogData(options: {
    match: RouteMatch
    provider: BlogDataProvider
    queryClient: QueryClient
}): Promise<void> {
    const { match, provider, queryClient } = options
    const queries = createBlogQueryKeys(provider)

    switch (match.type) {
        case "home": {
            const base = queries.posts.list({ limit: 10, published: true })
            await queryClient.prefetchInfiniteQuery({
                ...base,
                initialPageParam: 0,
                staleTime: 1000 * 60 * 5
            })
            return
        }
        case "tag": {
            const tag = match.params?.tag
            if (!tag) return
            const base = queries.posts.list({ tag, limit: 10 })
            await queryClient.prefetchInfiniteQuery({
                ...base,
                initialPageParam: 0,
                staleTime: 1000 * 60 * 5
            })
            return
        }
        case "post":
        case "edit": {
            const slug = match.params?.slug
            if (!slug) return
            const base = queries.posts.detail(slug)
            await queryClient.prefetchQuery({
                ...base,
                staleTime: 1000 * 60 * 5
            })
            return
        }
        case "drafts": {
            const base = queries.drafts.list({ limit: 10 })
            await queryClient.prefetchInfiniteQuery({
                ...base,
                initialPageParam: 0,
                staleTime: 1000 * 60 * 5
            })
            return
        }
        default:
            return
    }
}