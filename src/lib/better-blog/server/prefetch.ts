// Server-safe prefetch utilities
// NO "use client" directive - can be called from server components

import type { QueryClient } from '@tanstack/react-query';
import type { BlogDataProvider, RouteMatch } from '../core/types';
import { routeSchema } from '../core/routes';

export async function prefetchBlogData(
  routeMatch: RouteMatch, 
  serverConfig: BlogDataProvider, 
  queryClient: QueryClient
): Promise<void> {
  // Find the route definition for this route type
  const routeDef = routeSchema.routes.find(route => route.type === routeMatch.type);
  
  if (!routeDef || !routeDef.data) {
    // No data fetching needed for this route
    return;
  }
  
  // Use the route's query key factory to generate consistent keys
  const queryKey = routeDef.data.queryKey(routeMatch.params || {});
  
  if (routeDef.data.isInfinite) {
    // Use prefetchInfiniteQuery for paginated routes
    await queryClient.prefetchInfiniteQuery({
      queryKey,
      queryFn: async ({ pageParam = 0 }) => {
        // Use the route schema's server data handler
        return await routeDef.data!.server(routeMatch.params || {}, serverConfig);
      },
      initialPageParam: 0,
      staleTime: 1000 * 60 * 5, // 5 minutes - matches client-side hooks
    });
  } else {
    // Use regular prefetchQuery for single data routes
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        // Use the route schema's server data handler
        return await routeDef.data!.server(routeMatch.params || {}, serverConfig);
      },
      staleTime: 1000 * 60 * 5, // 5 minutes - matches client-side hooks
    });
  }
}