"use client";

import React from 'react';
import type { BlogDataProvider } from '../core/types';
import type { PageComponentOverrides } from '../core/client-components';

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


export interface BetterBlogContextProviderProps {
  clientConfig: BlogDataProvider;
  components?: ComponentsContextValue;
  pageOverrides?: PageComponentOverrides;
  children: React.ReactNode;
}

export function BetterBlogContextProvider({ 
  clientConfig, 
  components = defaultComponents,
  pageOverrides,
  children 
}: BetterBlogContextProviderProps) {
  const contextValue: BetterBlogContextValue = {
    clientConfig,
    components,
    pageOverrides,
  };

  return (
    <BetterBlogContext.Provider value={contextValue}>
      {children}
    </BetterBlogContext.Provider>
  );
}