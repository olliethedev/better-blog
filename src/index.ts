// Server-safe and client-safe exports (can be used in Next.js server components and SSR)
export { matchRoute, generateStaticRoutes } from "./core/router"
export { generatePostMetadata } from "./core/utils"
export type * from "./core/types"

//schemas
export * from "./schema/post"

//queries

export { createBlogQueryKeys } from "./queries"
export { getOrCreateQueryClient } from "./core/get-query-client"

// providers
export {
    createDummyMemoryDBProvider,
    createDemoMemoryDBProvider
} from "./providers/dummy-memory-db-provider"