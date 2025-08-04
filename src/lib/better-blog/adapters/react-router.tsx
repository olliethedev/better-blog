import type React from 'react';
import { BetterBlogCore } from '../core';
import type { BetterBlogConfig } from '../core/types';
import type { ComponentsContextValue } from '../../../components/better-blog/components-context';
import { BlogProvider } from '../providers/blog-provider';
import { BlogRouterPage } from '../../../components/better-blog/blog-router-page';

export interface RouterDependencies {
  useParams: () => { '*'?: string };
  Navigate: React.ComponentType<{ 
    to: string; 
    replace?: boolean;
  }>;
}

export interface ReactRouterBetterBlogAdapter {
  BlogRouter: React.ComponentType<{
    components: ComponentsContextValue;
  }>;
  generateRoutes: (components: ComponentsContextValue) => Array<{
    path: string;
    element: React.ReactElement;
  }>;
}

export function createReactRouterAdapter(
  config: BetterBlogConfig,
  router: RouterDependencies
): ReactRouterBetterBlogAdapter {
  const blog = new BetterBlogCore(config);

  function BlogRouter({ components }: { components: ComponentsContextValue }) {
    const params = router.useParams();
    const slug = params['*']?.split('/').filter(Boolean) || [];
    const routeMatch = blog.matchRoute(slug);
    
    return (
      <BlogProvider
        routeMatch={routeMatch}
        components={components}
        config={config}
      >
        <BlogRouterPage />
      </BlogProvider>
    );
  }

  function generateRoutes(components: ComponentsContextValue) {
    return [
      {
        path: '/posts/*',
        element: <BlogRouter components={components} />,
      },
    ];
  }

  return {
    BlogRouter,
    generateRoutes,
  };
}

