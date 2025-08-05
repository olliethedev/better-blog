"use client";
import React from "react";

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

export const ComponentsContext =
  React.createContext<ComponentsContextValue>(defaultComponents);

export function useComponents() {
  return React.useContext(ComponentsContext);
}

export function ComponentsProvider({
  children,
  components,
}: {
  children: React.ReactNode;
  components: ComponentsContextValue;
}) {
  return (
    <ComponentsContext.Provider value={components}>
      {children}
    </ComponentsContext.Provider>
  );
}
