import type { BlogDataProvider } from "@/types"

interface RouterOpenAPIOptions {
    disabled?: boolean
    path?: string
    scalar?: {
        title?: string
        version?: string
        description?: string
        theme?: string
    }
}

export interface BlogApiRouterOptions {
    basePath?: string
    /**
     * Expose OpenAPI UI; disabled by default to avoid leaking routes by accident.
     * Pass-through to better-call's router openapi config.
     */
    openapi?: RouterOpenAPIOptions
}

export interface CreateBlogApiRouterOptions extends BlogApiRouterOptions {
    provider: BlogDataProvider
}
