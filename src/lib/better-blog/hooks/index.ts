// Specialized hooks for better-blog data operations
"use client";

import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query"
import type { InfiniteData } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { useDebounce } from "../../../hooks/use-debounce"
import { useBetterBlogContext } from "../context/better-blog-context"
import { createBlogQueries } from "../core/queries"
import type { Post, Tag } from "../core/types"

// ============================================================================
// CORE HOOK TYPES
// ============================================================================

export interface UsePostsOptions {
    tag?: string
    limit?: number
    enabled?: boolean
    query?: string
}

export interface UsePostsResult {
    posts: Post[]
    isLoading: boolean
    error: Error | null
    loadMore: () => void
    hasMore: boolean
    isLoadingMore: boolean
    refetch: () => void
}

export interface UsePostResult {
    post: Post | null
    isLoading: boolean
    error: Error | null
    refetch: () => void
}

export interface UseTagsResult {
    tags: Tag[]
    isLoading: boolean
    error: Error | null
    refetch: () => void
}

export interface UsePostSearchOptions {
    query: string
    enabled?: boolean
    debounceMs?: number
    limit?: number
}

export interface UsePostSearchResult {
    posts: Post[]
    data: Post[]
    isLoading: boolean
    error: Error | null
    refetch: () => void
    isSearching: boolean
    searchQuery: string
}

export interface UseDraftsResult {
    drafts: Post[]
    isLoading: boolean
    error: Error | null
    loadMore: () => void
    hasMore: boolean
    isLoadingMore: boolean
    refetch: () => void
}

// ============================================================================
// SPECIALIZED DATA HOOKS
// ============================================================================

/**
 * Hook for fetching paginated posts with load more functionality
 */
export function usePosts(options: UsePostsOptions = {}): UsePostsResult {
    const { clientConfig } = useBetterBlogContext()
    const { tag, limit = 10, enabled = true, query } = options
    const queries = createBlogQueries(clientConfig)

    const basePosts = queries.posts.list({ tag, query, limit })
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    } = useInfiniteQuery({
        ...basePosts,
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const posts = lastPage as Post[]
            if (posts.length < limit) return undefined
            return allPages.length * limit
        },
        enabled: enabled && !!clientConfig,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10
    })

    const posts = ((
        data as unknown as InfiniteData<Post[], number> | undefined
    )?.pages?.flat() ?? []) as Post[]

    return {
        posts,
        isLoading,
        error,
        loadMore: fetchNextPage,
        hasMore: !!hasNextPage,
        isLoadingMore: isFetchingNextPage,
        refetch
    }
}

/**
 * Hook for fetching a single post by slug
 */
export function usePost(slug?: string): UsePostResult {
    const { clientConfig } = useBetterBlogContext()
    const queries = createBlogQueries(clientConfig)

    const basePost = queries.posts.detail(slug ?? "")
    const { data, isLoading, error, refetch } = useQuery<
        Post | null,
        Error,
        Post | null,
        typeof basePost.queryKey
    >({
        ...basePost,
        enabled: !!clientConfig && !!slug,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10
    })

    return {
        post: data || null,
        isLoading,
        error,
        refetch
    }
}

/**
 * Hook for fetching posts by tag with pagination
 */
export function useTagPosts(tag?: string): UsePostsResult {
    return usePosts({ tag, enabled: !!tag })
}

/**
 * Hook for fetching all unique tags across posts
 */
export function useTags(): UseTagsResult {
    const { clientConfig } = useBetterBlogContext()
    const queries = createBlogQueries(clientConfig)

    const baseTags = queries.tags.list
    const { data, isLoading, error, refetch } = useQuery<
        Tag[],
        Error,
        Tag[],
        typeof baseTags.queryKey
    >({
        ...baseTags,
        enabled: !!clientConfig,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10
    })

    return {
        tags: data ?? [],
        isLoading,
        error,
        refetch
    }
}

/**
 * Hook for fetching draft posts with pagination
 */
export function useDrafts(): UseDraftsResult {
    const { clientConfig } = useBetterBlogContext()
    const queries = createBlogQueries(clientConfig)

    const baseDrafts = queries.drafts.list({ limit: 10 })
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    } = useInfiniteQuery({
        ...baseDrafts,
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const posts = lastPage as Post[]
            if (posts.length < 10) return undefined
            return allPages.length * 10
        },
        enabled: !!clientConfig,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10
    })

    const drafts = ((
        data as unknown as InfiniteData<Post[], number> | undefined
    )?.pages?.flat() ?? []) as Post[]

    return {
        drafts,
        isLoading,
        error,
        loadMore: fetchNextPage,
        hasMore: !!hasNextPage,
        isLoadingMore: isFetchingNextPage,
        refetch
    }
}

/**
 * Hook for searching posts by a free-text query. Uses `usePosts` under the hood.
 * Debounces the query and preserves last successful results to avoid flicker.
 */
export function usePostSearch({
    query,
    enabled = true,
    debounceMs = 300,
    limit = 10
}: UsePostSearchOptions): UsePostSearchResult {
    const debouncedQuery = useDebounce(query, debounceMs)
    const shouldSearch = enabled && debouncedQuery.trim().length > 0

    const lastResultsRef = useRef<Post[]>([])

    const { posts, isLoading, error, refetch } = usePosts({
        query: debouncedQuery,
        limit,
        enabled: shouldSearch
    })

    useEffect(() => {
        if (!isLoading && posts && posts.length >= 0) {
            lastResultsRef.current = posts
        }
    }, [posts, isLoading])

    const dataToReturn = isLoading ? lastResultsRef.current : posts

    return {
        posts: dataToReturn,
        // compatibility alias similar to tanstack useQuery
        data: dataToReturn,
        isLoading,
        error,
        refetch,
        isSearching: isLoading,
        searchQuery: debouncedQuery
    }
}

// ============================================================================
// MUTATION HOOKS (for future extensibility)
// ============================================================================

/**
 * Hook for creating a new post
 */
export function useCreatePost() {
    const queryClient = useQueryClient()
    const { clientConfig } = useBetterBlogContext()
    const queries = createBlogQueries(clientConfig)

    return useMutation({
        // Accept unknown shape to allow adapters (e.g., Prisma) to pass nested inputs
        mutationFn: async (postData: unknown) => {
            // This would be implemented when we add write operations
            throw new Error("Create post not implemented yet")
        },
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: queries.posts.list._def })
            queryClient.invalidateQueries({
                queryKey: queries.drafts.list._def
            })
        }
    })
}

/**
 * Hook for updating a post
 */
export function useUpdatePost() {
    const queryClient = useQueryClient()
    const { clientConfig } = useBetterBlogContext()
    const queries = createBlogQueries(clientConfig)

    return useMutation({
        // Accept unknown shape to allow adapters (e.g., Prisma) to pass nested inputs
        mutationFn: async ({ slug, data }: { slug: string; data: unknown }) => {
            // This would be implemented when we add write operations
            throw new Error("Update post not implemented yet")
        },
        onSuccess: (_, { slug }) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({
                queryKey: queries.posts.detail(slug).queryKey
            })
            queryClient.invalidateQueries({ queryKey: queries.posts.list._def })
        }
    })
}

/**
 * Hook for deleting a post
 */
export function useDeletePost() {
    const queryClient = useQueryClient()
    const { clientConfig } = useBetterBlogContext()
    const queries = createBlogQueries(clientConfig)

    return useMutation({
        mutationFn: async (slug: string) => {
            // This would be implemented when we add write operations
            throw new Error("Delete post not implemented yet")
        },
        onSuccess: () => {
            // Invalidate all post-related queries
            queryClient.invalidateQueries({ queryKey: queries.posts.list._def })
            queryClient.invalidateQueries({
                queryKey: queries.drafts.list._def
            })
        }
    })
}