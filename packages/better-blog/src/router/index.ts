// Core router exports (server-safe, no component imports)
export * from "./router"
export * from "./types"
export * from "./routes"
export { blogRouter, type BlogRoutes } from "./blog-router"
export { resolveMetadata, resolveSEO } from "./meta-resolver"
export { buildTanStackHead } from "./tanstack-head"
