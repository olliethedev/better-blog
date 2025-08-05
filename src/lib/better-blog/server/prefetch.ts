// Server-safe prefetch utilities
// NO "use client" directive - can be called from server components

import type { QueryClient } from '@tanstack/react-query';
import type { ServerBlogConfig, RouteMatch } from '../core/types';

export async function prefetchBlogData(
  routeMatch: RouteMatch, 
  serverConfig: ServerBlogConfig, 
  queryClient: QueryClient
): Promise<void> {
  const queryKey = ['blog', routeMatch.type, routeMatch.data];
  
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: async () => {
      switch (routeMatch.type) {
        case 'home':
          return await serverConfig.getAllPosts();
        
        case 'post': {
          if (!routeMatch.data?.slug) throw new Error('Post slug is required');
          const slug = routeMatch.data.slug;
          return await serverConfig.getPostBySlug?.(slug) ?? 
                 (await serverConfig.getAllPosts({ slug })).find(p => p.slug === slug) ?? null;
        }
        
        // case 'tag': {
        //   if (!routeMatch.data?.tag) throw new Error('Tag is required');
        //   return await dataAPI.getPostsByTag?.(routeMatch.data.tag) ??
        //          (await dataAPI.getAllPosts({ tag: routeMatch.data.tag }));
        // }
        
        // case 'drafts': {
        //   const allPosts = await dataAPI.getAllPosts();
        //   return allPosts.filter(post => !post.published);
        // }
        
        // case 'edit': {
        //   if (!routeMatch.data?.postSlug) throw new Error('Post slug is required for editing');
        //   const postSlug = routeMatch.data.postSlug;
        //   return await dataAPI.getPostBySlug?.(postSlug) ?? 
        //          (await dataAPI.getAllPosts({ slug: postSlug })).find(p => p.slug === postSlug) ?? null;
        // }
        
        // case 'new':
        //   return null;
        
        default:
          return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}