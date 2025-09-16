
import type { PageComponentOverrides } from "@/types"
import type { BlogDataProvider } from "@/types"
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
    generateMetadata: (
        path?: string
    ) => Promise<{ title: string; description?: string }>
    /**
     * Server entry component that prefetches data and renders the routed page
     * within a React Query hydration boundary.
     */
    BlogServerRouter: React.ComponentType<{
        /** Optional path string like "posts/my-post" (no leading slash). */
        path?: string
        /**
         * Optional overrides for server-side loading components rendered while
         * the page is being prepared.
         */
        loadingComponentOverrides?: Pick<
            PageComponentOverrides,
            | "HomeLoadingComponent"
            | "PostLoadingComponent"
            | "TagLoadingComponent"
            | "DraftsLoadingComponent"
            | "NewPostLoadingComponent"
            | "EditPostLoadingComponent"
        >
    }>
}

export interface CreateBlogServerAdapterOptions {
    provider: BlogDataProvider
    queryClient: QueryClient
}
export interface BlogPostMetadata {
    title: string
    description?: string
    image?: string
} // Component override interface
