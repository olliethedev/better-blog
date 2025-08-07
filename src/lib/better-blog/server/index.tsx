import React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { BlogDataProvider } from "../core/types";
import { generatePostMetadata } from "../core/utils";
import { BlogRouterPage } from "../../../components/better-blog/blog-router-page";
import { BlogLoading } from "../../../components/better-blog/loading";
import { prefetchBlogData } from "./prefetch";
import { generateStaticRoutes, matchRoute } from "../core/router";
import { resolveServerLoadingComponent } from "../core/server-components";
import type { PageComponentOverrides } from "../core/client-components";

export interface BetterBlogServerAdapter {
  generateStaticParams: () => Array<{ all: string[] }>;
  generateMetadata: (context: {
    params: Promise<{ all: string[] }>;
  }) => Promise<{ title: string; description?: string }>;
  Entry: React.ComponentType<{
    params: Promise<{ all: string[] }>;
    queryClient: QueryClient;
    loadingComponentOverrides?: Pick<PageComponentOverrides, 'HomeLoadingComponent' | 'PostLoadingComponent' | 'TagLoadingComponent' | 'DraftsLoadingComponent' | 'NewPostLoadingComponent' | 'EditPostLoadingComponent'>;
  }>;
}


export function createServerAdapter(
  serverConfig: BlogDataProvider,
  queryClient: QueryClient
): BetterBlogServerAdapter {

  return {
    generateStaticParams() {
      const staticRoutes = generateStaticRoutes();
      return staticRoutes.map((route) => ({ all: route.slug }));
    },

    async generateMetadata({ params }) {
      const { all: slug } = await params;
      const match = matchRoute(slug);
      
      // For post routes, fetch the actual post data to generate dynamic metadata
      if (match.type === 'post' && match.params?.slug) {
        try {
          const slug = match.params.slug;
          const post = await serverConfig.getPostBySlug?.(slug) ?? 
                       (await serverConfig.getAllPosts({ slug }))
                         .find(p => p.slug === slug);
          
          if (post) {
            return generatePostMetadata(post);
          }
        } catch (error) {
          console.error('Error fetching post metadata:', error);
          // Fall back to route-based metadata
        }
      }
      
      // Use fallback metadata from route match
      return {
        title: match.metadata.title,
        description: match.metadata.description,
        image: match.metadata.image,
      };
    },

    Entry: async function BlogEntry({ params, loadingComponentOverrides }) {
      const { all: slug } = await params;
      const routeMatch = matchRoute(slug);
      const LoadingComponent = resolveServerLoadingComponent(routeMatch.type, loadingComponentOverrides);
      
      // Use the resolved loading component, or fall back to BlogLoading with appropriate message
      const fallbackComponent = LoadingComponent ? (
        <LoadingComponent />
      ) : (
        <BlogLoading message={`Loading ${routeMatch.type}...`} />
      );
      
      return (
        <React.Suspense fallback={fallbackComponent}>
          <BlogEntryContent
            params={params}
            serverConfig={serverConfig}
            queryClient={queryClient}
          />
        </React.Suspense>
      );
    },
  };
}

async function BlogEntryContent({
  params,
  serverConfig,
  queryClient,
}: {
  params: Promise<{ all: string[] }>;
  serverConfig: BlogDataProvider;
  queryClient: QueryClient;
}) {
  const { all: slug } = await params;
  const routeMatch = matchRoute(slug);

  // Prefetch data on the server
  await prefetchBlogData(routeMatch, serverConfig, queryClient);

  // Dehydrate the state for hydration on the client
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
        <BlogRouterPage slug={slug} />
    </HydrationBoundary>
  );
}
