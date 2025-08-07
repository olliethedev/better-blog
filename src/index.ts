// Server-safe and client-safe exports (can be used in Next.js server components and SSR)
export { matchRoute, generateStaticRoutes } from './lib/better-blog/core/router';
export { generatePostMetadata } from './lib/better-blog/core/utils';
export type * from './lib/better-blog/core/types';