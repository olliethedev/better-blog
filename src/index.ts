// Core client-side functionality
// export { BetterBlogCore } from './lib/better-blog/core';
export * from './lib/better-blog/core/types';
// export * from './lib/better-blog/core/router';

// Shared components
export * from './components/better-blog/loading';
export * from './components/better-blog/posts-list';
export * from './components/better-blog/post-card';

// Default adapter for vanilla usage
// export * from './lib/better-blog/adapters/default';

// Generic providers for framework-agnostic usage
export { Providers, useComponents } from './providers';
export type { ProvidersProps, ComponentsContextValue } from './providers';