// Specialized hooks for better-blog data operations
"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBetterBlogContext } from '../context/better-blog-context';
import type { Post } from '../core/types';

// ============================================================================
// CORE HOOK TYPES
// ============================================================================

export interface UsePostsOptions {
  tag?: string;
  limit?: number;
  enabled?: boolean;
}

export interface UsePostsResult {
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  refetch: () => void;
}

export interface UsePostResult {
  post: Post | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseDraftsResult {
  drafts: Post[];
  isLoading: boolean;
  error: Error | null;
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  refetch: () => void;
}

// ============================================================================
// SPECIALIZED DATA HOOKS
// ============================================================================

/**
 * Hook for fetching paginated posts with load more functionality
 */
export function usePosts(options: UsePostsOptions = {}): UsePostsResult {
  const { clientConfig } = useBetterBlogContext();
  const { tag, limit = 10, enabled = true } = options;

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts', { tag }],
    queryFn: async ({ pageParam = 0 }) => {
      if (!clientConfig) throw new Error('Client config not available');
      return await clientConfig.getAllPosts({
        tag,
        offset: pageParam as number,
        limit,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const posts = lastPage as Post[];
      if (posts.length < limit) return undefined;
      return allPages.length * limit;
    },
    enabled: enabled && !!clientConfig,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const posts = (data?.pages.flat() ?? []) as Post[];

  return {
    posts,
    isLoading,
    error,
    loadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    isLoadingMore: isFetchingNextPage,
    refetch,
  };
}

/**
 * Hook for fetching a single post by slug
 */
export function usePost(slug?: string): UsePostResult {
  const { clientConfig } = useBetterBlogContext();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      if (!clientConfig || !slug) return null;
      
      // Try getPostBySlug first, fallback to getAllPosts filter
      const post = await clientConfig.getPostBySlug?.(slug);
      if (post) return post;
      
      const posts = await clientConfig.getAllPosts({ slug });
      return posts.find(p => p.slug === slug) || null;
    },
    enabled: !!clientConfig && !!slug,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return {
    post: data || null,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for fetching posts by tag with pagination
 */
export function useTagPosts(tag?: string): UsePostsResult {
  return usePosts({ tag, enabled: !!tag });
}

/**
 * Hook for fetching draft posts with pagination
 */
export function useDrafts(): UseDraftsResult {
  const { clientConfig } = useBetterBlogContext();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['drafts'],
    queryFn: async ({ pageParam = 0 }) => {
      if (!clientConfig) throw new Error('Client config not available');
      const posts = await clientConfig.getAllPosts({
        offset: pageParam as number,
        limit: 10,
      });
      return posts.filter(post => !post.published);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const posts = lastPage as Post[];
      if (posts.length < 10) return undefined;
      return allPages.length * 10;
    },
    enabled: !!clientConfig,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const drafts = (data?.pages.flat() ?? []) as Post[];

  return {
    drafts,
    isLoading,
    error,
    loadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    isLoadingMore: isFetchingNextPage,
    refetch,
  };
}



// ============================================================================
// MUTATION HOOKS (for future extensibility)
// ============================================================================

/**
 * Hook for creating a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postData: Partial<Post>) => {
      // This would be implemented when we add write operations
      throw new Error('Create post not implemented yet');
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
  });
}

/**
 * Hook for updating a post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: Partial<Post> }) => {
      // This would be implemented when we add write operations
      throw new Error('Update post not implemented yet');
    },
    onSuccess: (_, { slug }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['post', slug] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

/**
 * Hook for deleting a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (slug: string) => {
      // This would be implemented when we add write operations
      throw new Error('Delete post not implemented yet');
    },
    onSuccess: () => {
      // Invalidate all post-related queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
  });
}