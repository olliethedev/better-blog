"use client";

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ClientBlogConfig, RouteMatch } from '../core/types';

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

function useBlogData(routeMatch: RouteMatch, clientConfig?: ClientBlogConfig) {
  const queryClient = useQueryClient();
  const queryKey = ['blog', routeMatch.type, routeMatch.data];
  
  // If no clientConfig provided, read directly from cache (server-prefetched data)
  if (!clientConfig) {
    const cachedData = queryClient.getQueryData(queryKey);
    const queryState = queryClient.getQueryState(queryKey);
    
    return {
      data: cachedData,
      isLoading: false, // Never show loading on client - we either have data or we don't
      error: queryState?.error || null,
    };
  }

  // When clientConfig is available - use for client-side data fetching (infinite scroll, search, etc.)
  return useQuery({
    queryKey,
    queryFn: async () => {
      switch (routeMatch.type) {
        case 'home':
          return await clientConfig.getAllPosts();
        
        case 'post': {
          if (!routeMatch.data?.slug) throw new Error('Post slug is required');
          const slug = routeMatch.data.slug;
          return await clientConfig.getPostBySlug?.(slug) ?? 
                 (await clientConfig.getAllPosts({ slug })).find(p => p.slug === slug) ?? null;
        }
        
        default:
          return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

export interface BlogContextProviderProps {
  routeMatch: RouteMatch;
  clientConfig?: ClientBlogConfig;
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