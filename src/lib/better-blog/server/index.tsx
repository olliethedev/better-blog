import type { QueryClient } from "@tanstack/react-query";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import React from "react"
import { BlogRouterPage } from "../../../components/better-blog/blog-router-page";
import { BlogLoading } from "../../../components/better-blog/loading";
import type { PageComponentOverrides } from "../core/client-components"
import { generateStaticRoutes, matchRoute } from "../core/router";
import { resolveServerLoadingComponent } from "../core/server-components";
import type { BlogDataProvider, RouteMatch } from "../core/types"
import { generatePostMetadata } from "../core/utils"
import { prefetchBlogData } from "./prefetch"

export interface BetterBlogServerAdapter {
  generateStaticParams: () => Array<{ all: string[] }>;
  generateMetadata: (path?: string) => Promise<{ title: string; description?: string }>;
  Entry: React.ComponentType<{
    path?: string;
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

    async generateMetadata(path?: string) {
      const match = matchRoute(path?.split('/').filter(Boolean));
      
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

    Entry: async function BlogEntry({ path, loadingComponentOverrides }) {
      const routeMatch = matchRoute(path?.split('/').filter(Boolean));
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
            routeMatch={routeMatch}
            path={path}
            serverConfig={serverConfig}
            queryClient={queryClient}
          />
        </React.Suspense>
      );
    },
  };
}

 

async function BlogEntryContent({
    path,
    routeMatch,
    serverConfig,
    queryClient
}: {
    path?: string
    routeMatch: RouteMatch
    serverConfig: BlogDataProvider
    queryClient: QueryClient
}) {
    // Prefetch data on the server
    await prefetchBlogData(routeMatch, serverConfig, queryClient)

    // Dehydrate the state for hydration on the client
    const dehydratedState = dehydrate(queryClient)

    return (
        <HydrationBoundary state={dehydratedState}>
            <BlogRouterPage path={path} />
        </HydrationBoundary>
    )
}
