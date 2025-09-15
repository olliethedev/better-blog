import type { BlogDataProvider } from "@/types"

export interface Dummy {
    foo: string
}
export interface RouteDefinition {
    /** Route type identifier */
    type: string

    /** URL pattern to match (e.g., [], ['posts', ':slug'], ['tag', ':tag']) */
    pattern: (string | ":slug" | ":tag" | ":id")[]

    /** Static routes to generate for SSG (if applicable) */
    staticRoutes?: Array<{ slug: string[] }>

    /** Default metadata for this route */
    metadata: {
        title: string | ((params: Record<string, string>) => string)
        description?: string | ((params: Record<string, string>) => string)
        image?: string | ((params: Record<string, string>) => string)
    }

    // Components are handled separately in client-side code to maintain server/client separation
    /** Data fetching configuration for this route */
    data?: {
        /** Query key factory for this route */
        queryKey: (params: Record<string, string>) => unknown[]
        /** Server-side data fetcher */
        server: (
            params: Record<string, string>,
            provider: BlogDataProvider
        ) => Promise<unknown>
        /** Whether this route uses infinite query (pagination) */
        isInfinite?: boolean
    }
}
export interface RouteSchema {
    routes: RouteDefinition[]
}
