// Client-only entry point - contains "use client" components
// This file should only be imported in client contexts

import type React from 'react';
import { ComponentsProvider, useComponents, type ComponentsContextValue } from './components/better-blog/components-context';

// Client-side providers and context
export { BlogProvider, prefetchBlogData } from './lib/better-blog/providers/blog-provider';
export { useBlogContext } from './lib/better-blog/core/blog-context';

// Client-side components  
export { BlogRouterPage } from './components/better-blog/blog-router-page';
export { PostCard, PostCardSkeleton } from './components/better-blog/post-card';

// Framework component providers
export interface ProvidersProps {
  children: React.ReactNode;
  Link: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>;
  Image: React.ComponentType<{
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
  }>;
}

export function Providers({ children, Link, Image }: ProvidersProps) {
  const components: ComponentsContextValue = {
    Link,
    Image,
  };

  return (
    <ComponentsProvider components={components}>
      {children}
    </ComponentsProvider>
  );
}

// Re-export for advanced usage
export { useComponents, ComponentsProvider };
export type { ComponentsContextValue };