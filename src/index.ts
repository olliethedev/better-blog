// Core types (safe for both client and server)
export * from './lib/better-blog/core/types';

// Core business logic (safe for both client and server)
export { BetterBlogCore } from './lib/better-blog/core';

// Core router utilities (server-safe)
export { matchRoute, generateStaticRoutes } from './lib/better-blog/core/router';

// Server-safe utilities
export { prefetchBlogData } from './lib/better-blog/core/prefetch';

// Server-safe components (no "use client" directive)
export * from './components/better-blog/loading';
export * from './components/better-blog/posts-list';

// Note: Client components are exported from './client' entry point
// import { BlogRouterPage, PostCard } from 'better-blog/client';