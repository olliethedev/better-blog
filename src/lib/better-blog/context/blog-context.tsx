"use client";

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { BlogDataProvider, RouteMatch } from '../core/types';

export interface BlogContextValue {
  data: unknown;
  isLoading: boolean;
  error: Error | null;
}

const BlogContext = React.createContext<BlogContextValue | null>(null);

export function useBlogContext(): BlogContextValue {
  const context = React.useContext(BlogContext);
  if (!context) {
    throw new Error('useBlogContext must be used within a BlogContextProvider');
  }
  return context;
}

function useBlogData(routeMatch: RouteMatch, clientConfig?: BlogDataProvider) {
  const queryClient = useQueryClient();
  const queryKey = ['blog', routeMatch.type, routeMatch.params];
  
  // Always use useQuery for consistent behavior
  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      // If clientConfig is provided, use it for fetching
      if (clientConfig) {
        switch (routeMatch.type) {
          case 'home':
            return await clientConfig.getAllPosts();
          
          case 'post': {
            if (!routeMatch.params?.slug) throw new Error('Post slug is required');
            const slug = routeMatch.params.slug;
            return await clientConfig.getPostBySlug?.(slug) ?? 
                   (await clientConfig.getAllPosts({ slug })).find(p => p.slug === slug) ?? null;
          }
          
          default:
            return null;
        }
      }
      
      // This should never be called when no clientConfig due to enabled: false
      throw new Error('Query should be disabled when no clientConfig provided');
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    // Only enable when clientConfig is provided
    enabled: !!clientConfig,
    // For server-prefetched data, don't refetch
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // This is crucial: provide initial data from cache for hydration consistency
    initialData: () => {
      if (!clientConfig) {
        const cachedData = queryClient.getQueryData(queryKey);
        return cachedData;
      }
      return undefined;
    },
  });

  // When no clientConfig and query is disabled, manually override loading state
  // to ensure hydration consistency
  if (!clientConfig) {
    return {
      ...queryResult,
      isLoading: false, // Force loading to false for hydration consistency
      isPending: false, // Also override isPending if it exists
    };
  }

  return queryResult;
}

export interface BlogContextProviderProps {
  routeMatch: RouteMatch;
  clientConfig?: BlogDataProvider;
  children: React.ReactNode;
}

export function BlogContextProvider({ routeMatch, clientConfig, children }: BlogContextProviderProps) {
  const { data, isLoading, error } = useBlogData(routeMatch, clientConfig);

  const contextValue: BlogContextValue = {
    data,
    isLoading,
    error,
  };

  return (
    <BlogContext.Provider value={contextValue}>
      {children}
    </BlogContext.Provider>
  );
}