import React from 'react';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { BetterBlogCore } from '../core';
import type { BetterBlogConfig } from '../core/types';
import type { ComponentsContextValue } from '../../../components/better-blog/components-context';
import { BlogProvider } from '../providers/blog-provider';
import { prefetchBlogData } from '../core/prefetch';
import { BlogRouterPage } from '../../../components/better-blog/blog-router-page';
import { BlogLoading } from '../../../components/better-blog/loading';

export interface NextJsBetterBlogAdapter {
  dynamicParams: boolean;
  generateStaticParams: () => Array<{ all: string[] }>;
  generateMetadata: (context: {
    params: Promise<{ all: string[] }>;
  }) => Promise<{ title: string; description?: string }>;
  Entry: React.ComponentType<{
    params: Promise<{ all: string[] }>;
    components: ComponentsContextValue;
  }>;
}

export function createNextJsAdapter(
  config: BetterBlogConfig
): NextJsBetterBlogAdapter {
  const blog = new BetterBlogCore(config);

  return {
    dynamicParams: true,

    generateStaticParams() {
      const staticRoutes = blog.getStaticRoutes();
      return staticRoutes.map(route => ({ all: route.slug }));
    },

    async generateMetadata({ params }) {
      const { all: slug } = await params;
      const match = blog.matchRoute(slug);
      return {
        title: match.metadata.title,
        description: match.metadata.description,
      };
    },

    Entry: function BlogEntry({ params, components }) {
      return (
        <React.Suspense fallback={<BlogLoading />}>
          <BlogEntryContent params={params} blog={blog} components={components} config={config} />
        </React.Suspense>
      );
    },
  };
}

async function BlogEntryContent({
  params,
  blog,
  components,
  config,
}: {
  params: Promise<{ all: string[] }>;
  blog: BetterBlogCore;
  components: ComponentsContextValue;
  config: BetterBlogConfig;
}) {
  const { all: slug } = await params;
  const routeMatch = blog.matchRoute(slug);

  // Create QueryClient for server-side prefetching
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
      },
    },
  });

  // Prefetch data on the server
  await prefetchBlogData(routeMatch, config, queryClient);

  // Dehydrate the state for hydration on the client
  const dehydratedState = dehydrate(queryClient);

  return (
    <BlogProvider
      routeMatch={routeMatch}
      components={components}
      dehydratedState={dehydratedState}
    >
      <BlogRouterPage />
    </BlogProvider>
  );
}

// Legacy compatibility
export const BetterBlog = createNextJsAdapter;