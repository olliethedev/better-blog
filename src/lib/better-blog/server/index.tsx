import React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { BetterBlogCore } from "../core";
import type { ServerBlogConfig } from "../core/types";
import { BlogRouterPage } from "../../../components/better-blog/blog-router-page";
import { BlogLoading } from "../../../components/better-blog/loading";
import { prefetchBlogData } from "./prefetch";
import { matchRoute } from "../core/router";

export interface BetterBlogServerAdapter {
  generateStaticParams: () => Array<{ all: string[] }>;
  generateMetadata: (context: {
    params: Promise<{ all: string[] }>;
  }) => Promise<{ title: string; description?: string }>;
  Entry: React.ComponentType<{
    params: Promise<{ all: string[] }>;
    queryClient: QueryClient;
  }>;
}

export function createServerAdapter(
  serverConfig: ServerBlogConfig,
  queryClient: QueryClient
): BetterBlogServerAdapter {
  const blog = new BetterBlogCore(serverConfig);

  return {
    generateStaticParams() {
      const staticRoutes = blog.getStaticRoutes();
      return staticRoutes.map((route) => ({ all: route.slug }));
    },

    async generateMetadata({ params }) {
      const { all: slug } = await params;
      const match = blog.matchRoute(slug);
      return {
        title: match.metadata.title,
        description: match.metadata.description,
      };
    },

    Entry: function BlogEntry({ params }) {
      return (
        <React.Suspense fallback={<BlogLoading />}>
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
  serverConfig: ServerBlogConfig;
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
