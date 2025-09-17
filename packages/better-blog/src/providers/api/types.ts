import type { BlogDataProviderConfig } from "@/types"
import type { createClient } from "better-call/client"

export interface CreateApiBlogProviderOptions extends BlogDataProviderConfig {
    /** Base URL if the API is on a different domain than the blog */
    baseURL?: string
    /** Base URL including router basePath  example: "/api/posts" */
    basePath: string

    /**
     * Optional override used in tests to inject a custom HTTP client creator.
     * Must be compatible with better-call's createClient API.
     */
    createClientImpl?: typeof createClient
}
