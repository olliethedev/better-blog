"use client"

import { PostCard } from "@/components/better-blog/post-card"
import { PostCardSkeleton } from "@/components/better-blog/post-card-skeleton"
import React, { useMemo } from "react"
import {
    type BlogLocalization,
    blogLocalization
} from "../../../localization/blog-localization"
import type { PageComponentOverrides } from "../core/client-components"
import { createApiBlogProvider } from "../core/providers/api-provider"
import type { BlogDataProvider, Post } from "../core/types"

export interface ComponentsContextValue {
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

const defaultNavigate = (href: string) => {
    window.location.href = href
}

const defaultReplace = (href: string) => {
    window.location.replace(href)
}

// Default implementations using standard HTML elements
const defaultComponents: ComponentsContextValue = {
    Link: ({ href, children, className, ...props }) => (
        <a href={href} className={className} {...props}>
            {children}
        </a>
    ),
    Image: ({ src, alt = "", className, width, height, ...props }) => (
        // biome-ignore lint/a11y/useAltText: <explanation>
        <img
            src={src}
            alt={alt || "Image"}
            className={className}
            width={width}
            height={height}
            {...props}
        />
    ),
    PostCard: ({ post }) => <PostCard post={post} />,
    PostCardSkeleton: () => <PostCardSkeleton />
}

export interface BetterBlogContextValue {
    /**
     * Client used to load and mutate blog data.
     * When not provided in the provider, an API client is created from `apiBasePath`.
     */
    clientConfig: BlogDataProvider
    /**
     * Set of UI building-block components used throughout the blog UI.
     */
    components: ComponentsContextValue
    /**
     * Optional page-level component overrides (e.g., swapping list/detail implementations).
     */
    pageOverrides?: PageComponentOverrides
    /**
     * Base path for blog pages (used to build blog URLs).
     * @default "/posts"
     */
    basePath: string
    /**
     * Localization strings used throughout the blog UI.
     */
    localization: BlogLocalization
    /**
     * Admin UI permission flags; merged with defaults where unspecified.
     */
    adminOptions?: AdminOptions
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

const BetterBlogContext = React.createContext<BetterBlogContextValue | null>(
    null
)

export function useBetterBlogContext(): BetterBlogContextValue {
    const context = React.useContext(BetterBlogContext)
    if (!context) {
        throw new Error(
            "useBetterBlogContext must be used within a BetterBlogContextProvider"
        )
    }
    return context
}

export function useComponents(): ComponentsContextValue {
    const { components } = useBetterBlogContext()
    return components
}

export function usePageOverrides(): PageComponentOverrides | undefined {
    const { pageOverrides } = useBetterBlogContext()
    return pageOverrides
}

export function useBasePath(): string {
    const { basePath } = useBetterBlogContext()
    return basePath
}

export function useBlogPath(
    ...segments: Array<string | number | undefined | null>
): string {
    const basePath = useBasePath()
    return buildPath(basePath, ...segments)
}

export function buildPath(
    basePath: string,
    ...segments: Array<string | number | undefined | null>
): string {
    const cleaned = segments
        .filter((s) => s !== undefined && s !== null && `${s}`.length > 0)
        .map((s) => `${s}`.replace(/^\/+|\/+$/g, ""))
    const suffix = cleaned.join("/")
    if (basePath === "/" || basePath === "") {
        return suffix ? `/${suffix}` : "/"
    }
    return suffix ? `${basePath}/${suffix}` : basePath
}

// Admin UI permissions/options
export interface AdminOptions {
    /** Allow creating new posts */
    canCreate: boolean
    /** Allow updating existing posts */
    canUpdate: boolean
    /** Allow deleting posts */
    canDelete: boolean
}

const defaultAdminOptions: AdminOptions = {
    canCreate: false,
    canUpdate: false,
    canDelete: false
}

export function useAdminOptions(): AdminOptions {
    const { adminOptions } = useBetterBlogContext()
    return { ...defaultAdminOptions, ...(adminOptions ?? {}) }
}

export interface BetterBlogContextProviderProps {
    /**
     * Data provider used to fetch and mutate blog data.
     * If omitted, a default API provider is created using `apiBasePath`.
     */
    clientConfig?: BlogDataProvider
    /**
     * Overrides for internal UI components; falls back to standard HTML elements.
     */
    components?: Partial<ComponentsContextValue>
    /**
     * Optional page-level component overrides (swap list/detail page components).
     */
    pageOverrides?: PageComponentOverrides
    /**
     * Base path for blog pages (used to build blog URLs)
     * @default "/posts"
     */
    basePath?: string
    /**
     * Partial localization; merged with built-in defaults.
     */
    localization?: Partial<BlogLocalization>
    /**
     * Partial admin permission flags; merged with built-in defaults.
     */
    adminOptions?: Partial<AdminOptions>
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
     * Base path for the API router; used if no `clientConfig` is provided.
     * @default "/api/posts"
     */
    apiBasePath?: string
    /**
     * Whether to show the attribution link in the footer.
     * @default true
     */
    showAttribution?: boolean
}

export function BetterBlogContextProvider({
    clientConfig,
    components = defaultComponents,
    pageOverrides,
    basePath = "/posts",
    localization: localizationProp,
    adminOptions,
    children,
    navigate = defaultNavigate,
    replace = defaultReplace,
    uploadImage,
    apiBasePath = "/api/posts",
    showAttribution = true
}: BetterBlogContextProviderProps) {
    function normalizeBasePath(path: string): string {
        const withLeading = path.startsWith("/") ? path : `/${path}`
        return withLeading !== "/" && withLeading.endsWith("/")
            ? withLeading.slice(0, -1)
            : withLeading
    }

    const localization = useMemo(() => {
        return { ...blogLocalization, ...localizationProp } as BlogLocalization
    }, [localizationProp])

    const contextValue: BetterBlogContextValue = {
        clientConfig:
            clientConfig ?? createApiBlogProvider({ baseURL: apiBasePath }),
        components: {
            ...defaultComponents,
            ...components
        },
        pageOverrides,
        basePath: normalizeBasePath(basePath),
        localization,
        adminOptions: adminOptions
            ? { ...defaultAdminOptions, ...adminOptions }
            : defaultAdminOptions,
        navigate,
        replace,
        uploadImage,
        showAttribution
    }

    return (
        <BetterBlogContext.Provider value={contextValue}>
            {children}
        </BetterBlogContext.Provider>
    )
}
