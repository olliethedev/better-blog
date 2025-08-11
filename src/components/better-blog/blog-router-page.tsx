"use client";

import { matchRoute } from '../../lib/better-blog/core/router';
import { RouteProvider } from '../../lib/better-blog/context/route-context';
import { resolveRouteComponent } from '../../lib/better-blog/core/component-resolver';
import { useBetterBlogContext, usePageOverrides } from '../../lib/better-blog/context/better-blog-context';
import type { RouteMatch } from '../../lib/better-blog/core/types';


function NotFoundPage({ message }: { message: string }) {
  return (
    <div>
      <h1>Not Found</h1>
      <p>{message}</p>
    </div>
  );
}

// Internal component that renders based on routeMatch
function BlogRouterPageContent({ 
  routeMatch, 
  NotFoundComponent = NotFoundPage 
}: { 
  routeMatch: RouteMatch;
  NotFoundComponent?: React.ComponentType<{ message: string }>;
}) {
  // Components get route data via useRoute hook - no prop drilling needed!
  // Get page overrides from context
  const pageOverrides = usePageOverrides();
  
  // Resolve the component from the client-side component mappings with overrides
  const Component = resolveRouteComponent(routeMatch, pageOverrides);
  
  if (Component) {
    return <Component />;
  }
  
  // Fallback for unknown routes
  return <NotFoundComponent message={routeMatch.metadata.title} />;
}

// Main component that takes slug and handles routing + context internally
export function BlogRouterPage({
  path,
}: {
  path?: string;
}) {


  const { basePath } = useBetterBlogContext();
  const routeMatch = matchRoute(path?.split('/').filter(Boolean), basePath);
  
  // Get page overrides from context to extract NotFoundComponent
  const pageOverrides = usePageOverrides();
  const NotFoundComponent = pageOverrides?.NotFoundComponent;

  return (
    <RouteProvider routeMatch={routeMatch}>
      <BlogRouterPageContent 
        routeMatch={routeMatch} 
        NotFoundComponent={NotFoundComponent}
      />
    </RouteProvider>
  );
}

