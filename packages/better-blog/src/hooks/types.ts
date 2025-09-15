import type { Post } from "@/types"
import type { Tag } from "@/types"
import type { useCreatePost, useDeletePost, useUpdatePost } from "./blog-hooks"

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

// ==========================================================================
// PUBLIC RESULT TYPES FOR MUTATION HOOKS
// ==========================================================================

export type UseCreatePostResult = ReturnType<typeof useCreatePost>
export type UseUpdatePostResult = ReturnType<typeof useUpdatePost>
export type UseDeletePostResult = ReturnType<typeof useDeletePost>