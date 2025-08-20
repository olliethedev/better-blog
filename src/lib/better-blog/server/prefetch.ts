// Server-safe prefetch utilities
// NO "use client" directive - can be called from server components

import type { QueryClient } from '@tanstack/react-query';
import { createBlogQueries } from "../core/queries"
import type { BlogDataProvider, RouteMatch } from "../core/types"

export async function prefetchBlogData(
    routeMatch: RouteMatch,
    serverConfig: BlogDataProvider,
    queryClient: QueryClient
): Promise<void> {
    const queries = createBlogQueries(serverConfig)

    switch (routeMatch.type) {
        case "home": {
            const base = queries.posts.list({ limit: 10 })
            await queryClient.prefetchInfiniteQuery({
                ...base,
                initialPageParam: 0,
                staleTime: 1000 * 60 * 5
            })
            return
        }
        case "tag": {
            const tag = routeMatch.params?.tag
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
            const slug = routeMatch.params?.slug
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