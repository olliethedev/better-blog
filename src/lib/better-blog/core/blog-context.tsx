"use client";

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { BetterBlogConfig, RouteMatch } from './types';

export interface BlogContextValue {
  routeMatch: RouteMatch;
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

function useBlogData(routeMatch: RouteMatch, dataAPI?: BetterBlogConfig) {
  const queryClient = useQueryClient();
  const queryKey = ['blog', routeMatch.type, routeMatch.data];
  
  // If no dataAPI (client-side), read directly from cache
  if (!dataAPI) {
    const cachedData = queryClient.getQueryData(queryKey);
    const queryState = queryClient.getQueryState(queryKey);
    
    return {
      data: cachedData,
      isLoading: false, // Never show loading on client - we either have data or we don't
      error: queryState?.error || null,
    };
  }

  // Server-side or when dataAPI is available - use normal useQuery
  return useQuery({
    queryKey,
    queryFn: async () => {
      switch (routeMatch.type) {
        case 'home':
          return await dataAPI.getAllPosts();
        
        case 'post': {
          if (!routeMatch.data?.slug) throw new Error('Post slug is required');
          const slug = routeMatch.data.slug;
          return await dataAPI.getPostBySlug?.(slug) ?? 
                 (await dataAPI.getAllPosts({ slug })).find(p => p.slug === slug) ?? null;
        }
        
        case 'tag': {
          if (!routeMatch.data?.tag) throw new Error('Tag is required');
          return await dataAPI.getPostsByTag?.(routeMatch.data.tag) ??
                 (await dataAPI.getAllPosts({ tag: routeMatch.data.tag }));
        }
        
        case 'drafts': {
          const allPosts = await dataAPI.getAllPosts();
          return allPosts.filter(post => !post.published);
        }
        
        case 'edit': {
          if (!routeMatch.data?.postSlug) throw new Error('Post slug is required for editing');
          const postSlug = routeMatch.data.postSlug;
          return await dataAPI.getPostBySlug?.(postSlug) ?? 
                 (await dataAPI.getAllPosts({ slug: postSlug })).find(p => p.slug === postSlug) ?? null;
        }
        
        case 'new':
          return null; // No data needed for new post form
        
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
  dataAPI?: BetterBlogConfig;
  children: React.ReactNode;
}

export function BlogContextProvider({ routeMatch, dataAPI, children }: BlogContextProviderProps) {
  const { data, isLoading, error } = useBlogData(routeMatch, dataAPI);

  const contextValue: BlogContextValue = {
    routeMatch,
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