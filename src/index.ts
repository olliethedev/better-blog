// Server-safe and client-safe exports (can be used in Next.js server components and SSR)
export { matchRoute, generateStaticRoutes } from './lib/better-blog/core/router';
export { generatePostMetadata } from './lib/better-blog/core/utils';
export type * from './lib/better-blog/core/types';

//schemas
export * from "./lib/better-blog/schema/post"

//queries

export { createBlogQueries } from "./lib/better-blog/core/queries"

// providers
export {
    createDummyMemoryDBProvider,
    createDemoMemoryDBProvider
} from "./lib/better-blog/core/providers/dummy-memory-db-provider"