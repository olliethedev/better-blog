import type { BlogDataProvider, BlogPageMetadata, SeoSiteConfig } from "@/types"
import type { QueryClient } from "@tanstack/react-query"
/**
 * The server adapter returned by `createBlogServerAdapter` for SSR/SSG frameworks.
 */
export interface BlogServerAdapter {
    /**
     * Return the list of all dynamic route params for static generation.
     * Useful for frameworks like Next.js `generateStaticParams`.
     */
    generateStaticParams: () => Array<{ all: string[] }>
    /**
     * Generate page metadata for the given path. Will attempt to fetch post data
     * for post routes to produce rich metadata, and otherwise falls back to
     * route-based defaults.
     */
    generateMetadata: (path?: string) => Promise<BlogPageMetadata>
    /**
     * Generate Next.js-compatible Metadata object (shape-only, no Next peer dep).
     */
    generateNextMetadata: (path?: string) => Promise<Record<string, unknown>>
    /**
     * Server entry component that prefetches data and renders the routed page
     * within a React Query hydration boundary.
     */
    BlogServerRouter: React.ComponentType<{
        /** Optional path string like "posts/my-post" (no leading slash). */
        path?: string
    }>
    prefetch: (options: {
        path?: string
    }) => Promise<void>
}

export interface CreateBlogServerAdapterOptions {
    provider: BlogDataProvider
    queryClient: QueryClient
    site?: SeoSiteConfig
}
