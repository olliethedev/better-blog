// Specialized hooks for better-blog data operations
"use client"

import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query"
import type { InfiniteData } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { useBlogContext } from "../context/better-blog-context"
import type { Post, Tag } from "../core/types"
import { createBlogQueryKeys } from "../queries"
import type {
    PostCreateExtendedInput,
    PostUpdateExtendedInput
} from "../schema/post"
import { useDebounce } from "./use-debounce"

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
    const { dataProvider } = useBlogContext()
    const { tag, limit = 10, enabled = true, query } = options
    const queries = createBlogQueryKeys(dataProvider)

    const queryParams = {
        tag,
        limit,
        query
    }

    const basePosts = queries.posts.list(queryParams)

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
        enabled: enabled && !!dataProvider,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10
    })

    const posts = ((
        data as InfiniteData<Post[], number> | undefined
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
    const { dataProvider } = useBlogContext()
    const queries = createBlogQueryKeys(dataProvider)

    const basePost = queries.posts.detail(slug ?? "")
    const { data, isLoading, error, refetch } = useQuery<
        Post | null,
        Error,
        Post | null,
        typeof basePost.queryKey
    >({
        ...basePost,
        enabled: !!dataProvider && !!slug,
        retry: false,
        refetchOnWindowFocus: false,
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
    const { dataProvider } = useBlogContext()
    const queries = createBlogQueryKeys(dataProvider)

    const baseTags = queries.tags.list
    const { data, isLoading, error, refetch } = useQuery({
        ...baseTags,
        enabled: !!dataProvider,
        retry: false,
        refetchOnWindowFocus: false,
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
    const { dataProvider } = useBlogContext()
    const queries = createBlogQueryKeys(dataProvider)

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
        enabled: !!dataProvider,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10
    })

    const drafts = (
        ((data as InfiniteData<Post[], number> | undefined)?.pages?.flat() ??
            []) as Post[]
    ).filter((p) => !p.published) as Post[]

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
    const shouldSearch = enabled && (query?.trim().length ?? 0) > 0

    const lastResultsRef = useRef<Post[]>([])

    // Only enable the query when there is an actual search term
    // This prevents empty searches from using the base posts query
    const { posts, isLoading, error, refetch } = usePosts({
        query: debouncedQuery,
        limit,
        enabled: shouldSearch && debouncedQuery.trim() !== ""
    })

    // If search is disabled or query is empty, always return empty results
    const effectivePosts = shouldSearch ? posts : []

    useEffect(() => {
        if (!isLoading && posts && posts.length >= 0) {
            lastResultsRef.current = posts
        }
    }, [posts, isLoading])

    const isDebouncing = enabled && debounceMs > 0 && debouncedQuery !== query
    const effectiveLoading = isLoading || isDebouncing
    // During loading, use the last results
    // For empty searches or when disabled, use empty array
    const dataToReturn = !shouldSearch
        ? []
        : effectiveLoading
          ? lastResultsRef.current
          : effectivePosts

    return {
        posts: dataToReturn,
        // compatibility alias similar to tanstack useQuery
        data: dataToReturn,
        isLoading: effectiveLoading,
        error,
        refetch,
        isSearching: effectiveLoading,
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
    const { dataProvider } = useBlogContext()
    const queries = createBlogQueryKeys(dataProvider)

    return useMutation({
        mutationFn: async (postData: PostCreateExtendedInput) => {
            if (!dataProvider?.createPost) {
                throw new Error("Create post not supported by provider")
            }
            return await dataProvider.createPost(postData)
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
    const { dataProvider } = useBlogContext()
    const queries = createBlogQueryKeys(dataProvider)

    return useMutation({
        mutationFn: async ({
            slug,
            data
        }: { slug: string; data: PostUpdateExtendedInput }) => {
            if (!dataProvider?.updatePost) {
                throw new Error("Update post not supported by provider")
            }
            return await dataProvider.updatePost(slug, data)
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
    const { dataProvider } = useBlogContext()
    const queries = createBlogQueryKeys(dataProvider)

    return useMutation({
        mutationFn: async (slug: string) => {
            if (!dataProvider?.deletePost) {
                throw new Error("Delete post not supported by provider")
            }
            await dataProvider.deletePost(slug)
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

// ==========================================================================
// PUBLIC RESULT TYPES FOR MUTATION HOOKS
// ==========================================================================

export type UseCreatePostResult = ReturnType<typeof useCreatePost>
export type UseUpdatePostResult = ReturnType<typeof useUpdatePost>
export type UseDeletePostResult = ReturnType<typeof useDeletePost>