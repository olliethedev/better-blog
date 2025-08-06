import type { RouteMatch } from './types';
import { routeSchema } from './routes';
import { matchPattern, resolveMetadata } from './route-schema';



export function matchRoute(slug?: string[]): RouteMatch {
  const normalizedSlug = slug || [];

  // Try to match against each route in the schema
  for (const routeDef of routeSchema.routes) {
    const { matches, params } = matchPattern(normalizedSlug, routeDef.pattern);
    
    if (matches) {
      const metadata = resolveMetadata(routeDef, params);
      
      return {
        type: routeDef.type as RouteMatch['type'],
        params,
        metadata
      };
    }
  }

  // Fallback for unknown routes
  return {
    type: 'unknown',
    metadata: {
      title: `Unknown route: /posts/${normalizedSlug.join('/')}`
    }
  };
}

export function generateStaticRoutes(): Array<{ slug: string[] }> {
  const staticRoutes: Array<{ slug: string[] }> = [];
  
  // Collect static routes from all route definitions
  for (const routeDef of routeSchema.routes) {
    if (routeDef.staticRoutes) {
      staticRoutes.push(...routeDef.staticRoutes);
    }
  }
  
  return staticRoutes;
}