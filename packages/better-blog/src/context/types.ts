import type { BlogLocalization } from "@/localization/blog-localization"
import type { BlogDataProvider, Post } from "@/types"
import type React from "react"
import type { defaultNavigate, defaultReplace } from "./defaults"

export interface BlogContextType {
    /**
     * Client used to load and mutate blog data.
     * When not provided in the provider, an API client is created from `apiBasePath`.
     */
    dataProvider: BlogDataProvider
    /**
     * Set of UI building-block components used throughout the blog UI.
     */
    components: BlogComponents
    /**
     * Base path for blog pages (used to build blog URLs).
     * @default {@link DEFAULT_PAGES_BASE_PATH}
     */
    basePath: string
    /**
     * Localization strings used throughout the blog UI.
     */
    localization: BlogLocalization
    /**
     * Admin UI permission flags; merged with defaults where unspecified.
     */
    adminPermissions?: AdminPermissions
    /**
     * Imperative navigation function for pushing a new URL.
     * Defaults to `window.location.href = href` in the browser.
     */
    navigate: typeof defaultNavigate
    /**
     * Imperative navigation function for replacing the current URL.
     * Defaults to `window.location.replace(href)` in the browser.
     */
    replace: typeof defaultReplace
    /**
     * Function used by the editor/admin UI to upload an image and return its URL.
     */
    uploadImage: (file: File) => Promise<string>
    /**
     * Whether to show the attribution link in the footer.
     * @default true
     */
    showAttribution: boolean
}

export interface BlogProviderProps {
    /**
     * Data provider used to fetch and mutate blog data.
     * If omitted, a default API provider is created using `apiBasePath`.
     */
    dataProvider?: BlogDataProvider
    /**
     * Overrides for internal UI components; falls back to standard HTML elements.
     */
    components?: BlogUIComponents
    /**
     * Base path for blog pages (used to build blog URLs)
     * @default {@link DEFAULT_PAGES_BASE_PATH}
     */
    basePath?: string
    /**
     * Partial localization; merged with built-in defaults.
     */
    localization?: Partial<BlogLocalization>
    /**
     * Partial admin permission flags; merged with built-in defaults.
     */
    adminPermissions?: Partial<AdminPermissions>
    /**
     * Children that will have access to the blog context.
     */
    children: React.ReactNode
    /**
     * Imperative navigation function for pushing a new URL.
     * @default defaultNavigate
     */
    navigate?: typeof defaultNavigate
    /**
     * Imperative navigation function for replacing the current URL.
     * @default defaultReplace
     */
    replace?: typeof defaultReplace
    /**
     * Function used to upload an image and return its URL.
     */
    uploadImage: (file: File) => Promise<string>
    /**
     * Base path for the API router; used if no `dataProvider` is provided.
     * @default {@link DEFAULT_API_BASE_PATH}
     */
    apiBasePath?: string
    /**
     * Base URL for the API router; used if no `dataProvider` is provided. Provide if your API is on a different domain.
     */
    apiBaseURL?: string
    /**
     * Whether to show the attribution link in the footer.
     * @default true
     */
    showAttribution?: boolean
}

export interface AdminPermissions {
    /** Allow creating new posts */
    canCreate: boolean
    /** Allow updating existing posts */
    canUpdate: boolean
    /** Allow deleting posts */
    canDelete: boolean
}

export interface BlogComponents {
    /**
     * Component used to navigate to a different URL.
     * Useful to integrate with router frameworks that have their own `Link`.
     */
    Link: React.ComponentType<{
        href: string
        children: React.ReactNode
        className?: string
    }>
    /**
     * Component used to render images.
     * Replace this when integrating with frameworks like Next.js `Image`.
     */
    Image: React.ComponentType<{
        src: string
        alt: string
        className?: string
        width?: number
        height?: number
    }>
    /**
     * Component used to render an individual blog post card in lists.
     */
    PostCard: React.ComponentType<{
        post: Post
    }>
    /**
     * Skeleton component shown while a `PostCard` is loading.
     */
    PostCardSkeleton: React.ComponentType
}

export type BlogUIComponents = Partial<BlogComponents>
export interface RouteContextValue {
    /**
     * Current route type for conditional rendering
     */
    type: import("@/types").RouteType
    /**
     * Route parameters extracted from the path
     */
    params?: Record<string, string>
}
export interface RouteProviderProps {
    type: import("@/types").RouteType
    params?: Record<string, string>
    children: React.ReactNode
}
