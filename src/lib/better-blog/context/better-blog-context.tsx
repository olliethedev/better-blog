"use client";

import React, { useMemo } from 'react';
import type { BlogDataProvider } from '../core/types';
import type { PageComponentOverrides } from '../core/client-components';
import {
  type BlogLocalization,
  blogLocalization
} from "../../../localization/blog-localization"

export interface ComponentsContextValue {
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

// Default implementations using standard HTML elements
const defaultComponents: ComponentsContextValue = {
  Link: ({ href, children, className, ...props }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
  Image: ({ src, alt = "", className, width, height, ...props }) => (
    // biome-ignore lint/a11y/useAltText: <explanation>
    <img
      src={src}
      alt={alt || "Image"}
      className={className}
      width={width}
      height={height}
      {...props}
    />
  ),
};

export interface BetterBlogContextValue {
  clientConfig: BlogDataProvider;
  components: ComponentsContextValue;
  pageOverrides?: PageComponentOverrides;
  basePath: string;
  localization: BlogLocalization;
}

const BetterBlogContext = React.createContext<BetterBlogContextValue | null>(null);

export function useBetterBlogContext(): BetterBlogContextValue {
  const context = React.useContext(BetterBlogContext);
  if (!context) {
    throw new Error('useBetterBlogContext must be used within a BetterBlogContextProvider');
  }
  return context;
}

export function useComponents(): ComponentsContextValue {
  const { components } = useBetterBlogContext();
  return components;
}

export function usePageOverrides(): PageComponentOverrides | undefined {
  const { pageOverrides } = useBetterBlogContext();
  return pageOverrides;
}

export function useBasePath(): string {
  const { basePath } = useBetterBlogContext();
  return basePath;
}

export function useBlogPath(
  ...segments: Array<string | number | undefined | null>
): string {
  const basePath = useBasePath();
  const cleaned = segments
    .filter((s) => s !== undefined && s !== null && `${s}`.length > 0)
    .map((s) => `${s}`.replace(/^\/+|\/+$/g, ''));
  const suffix = cleaned.join('/');
  if (basePath === '/' || basePath === '') {
    return suffix ? `/${suffix}` : '/';
  }
  return suffix ? `${basePath}/${suffix}` : basePath;
}


export interface BetterBlogContextProviderProps {
  clientConfig: BlogDataProvider;
  components?: Partial<ComponentsContextValue>; // defaults to standard HTML elements
  pageOverrides?: PageComponentOverrides;
  basePath?: string; // defaults to "/posts"
  localization?: BlogLocalization;
  children: React.ReactNode;
}

export function BetterBlogContextProvider({ 
  clientConfig, 
  components = defaultComponents,
  pageOverrides,
  basePath = '/posts',
  localization: localizationProp,
  children 
}: BetterBlogContextProviderProps) {
  function normalizeBasePath(path: string): string {
    const withLeading = path.startsWith('/') ? path : `/${path}`;
    return withLeading !== '/' && withLeading.endsWith('/')
      ? withLeading.slice(0, -1)
      : withLeading;
  }

  const localization = useMemo(() => {
    return { ...blogLocalization, ...localizationProp } as BlogLocalization
}, [localizationProp])

  const contextValue: BetterBlogContextValue = {
    clientConfig,
    components: {
      ...defaultComponents,
      ...components,
    },
    pageOverrides,
    basePath: normalizeBasePath(basePath),
    localization,
  };

  return (
    <BetterBlogContext.Provider value={contextValue}>
      {children}
    </BetterBlogContext.Provider>
  );
}