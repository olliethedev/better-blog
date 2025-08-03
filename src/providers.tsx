"use client";

import type React from 'react';
import { ComponentsProvider } from './components/better-blog/components-context';
import type { ComponentsContextValue } from './components/better-blog/components-context';

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

// Re-export context utilities for advanced usage
export { useComponents } from './components/better-blog/components-context';
export type { ComponentsContextValue } from './components/better-blog/components-context';