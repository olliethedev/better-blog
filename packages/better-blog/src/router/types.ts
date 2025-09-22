import type { RouteMatch } from "@/types"

export interface RouteDefinition {
    /** Route type identifier */
    type: RouteMatch["type"]

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
}
export interface RouteSchema {
    routes: RouteDefinition[]
}
