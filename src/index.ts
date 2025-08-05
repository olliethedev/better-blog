// Server-safe exports (can be used in Next.js server components and SSR)
// Import these as: import { BetterBlogCore, matchRoute } from 'better-blog'
export { BetterBlogCore } from './lib/better-blog/core';
export { matchRoute, generateStaticRoutes } from './lib/better-blog/core/router';
export type * from './lib/better-blog/core/types';