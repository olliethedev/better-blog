"use client";

import React from 'react';
import { QueryClient, QueryClientProvider, HydrationBoundary, type DehydratedState } from '@tanstack/react-query';
import { ComponentsProvider, type ComponentsContextValue } from '../../../components/better-blog/components-context';
import { BlogContextProvider } from '../core/blog-context';
import type { RouteMatch, BetterBlogConfig } from '../core/types';

export interface BlogProviderProps {
  routeMatch: RouteMatch;
  components: ComponentsContextValue;
  children: React.ReactNode;
  dehydratedState?: DehydratedState;
  config?: BetterBlogConfig;
}

export function BlogProvider({ 
  routeMatch, 
  components, 
  children,
  dehydratedState,
  config 
}: BlogProviderProps) {
  // Create a query client for the client-side
  const [queryClient] = React.useState(() => 
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 10, // 10 minutes
          refetchOnWindowFocus: false,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <ComponentsProvider components={components}>
          <BlogContextProvider routeMatch={routeMatch} dataAPI={config}>
            {children}
          </BlogContextProvider>
        </ComponentsProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}

