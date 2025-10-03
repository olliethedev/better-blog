// Import for use in helpers
import { blogRouter } from "./blog-router"

// Core router exports
export * from "./routes"
export { blogRouter, type BlogRoutes } from "./blog-router"
export { resolveMetadata, resolveSEO } from "./meta-resolver"
export type { RouteType, RouteInfo } from "@/types"

/**
 * Route path constants for building URLs
 */
export const ROUTE_PATHS = {
    /** Home page path: / */
    HOME: "/",
    /** New post form path: /new */
    NEW: "/new",
    /** Drafts list path: /drafts */
    DRAFTS: "/drafts",
    /** Tag page path builder */
    TAG: (tag: string) => `/tag/${tag}`,
    /** Post detail path builder */
    POST: (slug: string) => `/${slug}`,
    /** Edit post form path builder */
    EDIT: (slug: string) => `/${slug}/edit`
} as const

/**
 * Route type guards for checking route types
 */
export function isHomeRoute(
    route: ReturnType<typeof blogRouter.getRoute>
): boolean {
    const extra = route?.extra as (() => { type: string }) | undefined
    return extra?.()?.type === "home"
}

export function isPostRoute(
    route: ReturnType<typeof blogRouter.getRoute>
): boolean {
    const extra = route?.extra as (() => { type: string }) | undefined
    return extra?.()?.type === "post"
}

export function isTagRoute(
    route: ReturnType<typeof blogRouter.getRoute>
): boolean {
    const extra = route?.extra as (() => { type: string }) | undefined
    return extra?.()?.type === "tag"
}

export function isDraftsRoute(
    route: ReturnType<typeof blogRouter.getRoute>
): boolean {
    const extra = route?.extra as (() => { type: string }) | undefined
    return extra?.()?.type === "drafts"
}

export function isNewRoute(
    route: ReturnType<typeof blogRouter.getRoute>
): boolean {
    const extra = route?.extra as (() => { type: string }) | undefined
    return extra?.()?.type === "new"
}

export function isEditRoute(
    route: ReturnType<typeof blogRouter.getRoute>
): boolean {
    const extra = route?.extra as (() => { type: string }) | undefined
    return extra?.()?.type === "edit"
}

/**
 * Helper to extract route info from yar route
 */
export function getRouteInfo(path: string): import("@/types").RouteInfo {
    const route = blogRouter.getRoute(path)
    const extra = route?.extra as (() => { type: string }) | undefined
    const type = (extra?.()?.type || "unknown") as import("@/types").RouteType

    return {
        type,
        params: route?.params
    }
}

/**
 * Helper to prefetch route data
 */
export async function prefetchRoute(
    path: string,
    provider: import("@/types").BlogDataProvider,
    queryClient: import("@tanstack/react-query").QueryClient
): Promise<void> {
    const route = blogRouter.getRoute(path)
    if (route?.loader) {
        await (
            route.loader as (
                provider: import("@/types").BlogDataProvider,
                queryClient: import("@tanstack/react-query").QueryClient
            ) => Promise<void>
        )(provider, queryClient)
    }
}
