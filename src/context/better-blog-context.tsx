"use client"

import { PostCard } from "@/components/better-blog/post-card"
import { PostCardSkeleton } from "@/components/better-blog/post-card-skeleton"
import { DEFAULT_API_BASE_PATH, DEFAULT_PAGES_BASE_PATH } from "@/lib/constants"
import type { PageComponentOverrides } from "@/types"
import type { Post } from "@/types"
import type { BlogDataProvider } from "@/types"
import React, { useMemo } from "react"
import { normalizeBasePath } from "../lib/utils"
import {
    type BlogLocalization,
    blogLocalization
} from "../localization/blog-localization"
import { createBlogApiProvider } from "../providers/api-provider"

interface BlogComponents {
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

const defaultNavigate = (href: string) => {
    window.location.href = href
}

const defaultReplace = (href: string) => {
    window.location.replace(href)
}

// Default implementations using standard HTML elements
const defaultUIComponents: BlogComponents = {
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
     * Optional page-level component overrides (e.g., swapping list/detail implementations).
     */
    pageOverrides?: PageComponentOverrides
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

const BlogContext = React.createContext<BlogContextType | null>(null)

export function useBlogContext(): BlogContextType {
    const context = React.useContext(BlogContext)
    if (!context) {
        throw new Error("useBlogContext must be used within a BlogProvider")
    }
    return context
}

export function useComponents(): BlogComponents {
    const { components } = useBlogContext()
    return components
}

export function usePageOverrides(): PageComponentOverrides | undefined {
    const { pageOverrides } = useBlogContext()
    return pageOverrides
}

export function useBasePath(): string {
    const { basePath } = useBlogContext()
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
export interface AdminPermissions {
    /** Allow creating new posts */
    canCreate: boolean
    /** Allow updating existing posts */
    canUpdate: boolean
    /** Allow deleting posts */
    canDelete: boolean
}

const defaultAdminPermissions: AdminPermissions = {
    canCreate: false,
    canUpdate: false,
    canDelete: false
}

export function useAdminPermissions(): AdminPermissions {
    const { adminPermissions } = useBlogContext()
    return { ...defaultAdminPermissions, ...(adminPermissions ?? {}) }
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
     * Optional page-level component overrides (swap list/detail page components).
     */
    pageOverrides?: PageComponentOverrides
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

export function BlogProvider({
    dataProvider,
    components = defaultUIComponents,
    pageOverrides,
    basePath = DEFAULT_PAGES_BASE_PATH,
    localization: localizationProp,
    adminPermissions,
    children,
    navigate = defaultNavigate,
    replace = defaultReplace,
    uploadImage,
    apiBasePath = DEFAULT_API_BASE_PATH,
    apiBaseURL,
    showAttribution = true
}: BlogProviderProps) {
    const localization = useMemo(() => {
        return { ...blogLocalization, ...localizationProp } as BlogLocalization
    }, [localizationProp])

    const contextValue: BlogContextType = {
        dataProvider:
            dataProvider ??
            createBlogApiProvider({
                baseURL: apiBaseURL,
                basePath: apiBasePath
            }),
        components: {
            ...defaultUIComponents,
            ...components
        },
        pageOverrides,
        basePath: normalizeBasePath(basePath),
        localization,
        adminPermissions: adminPermissions
            ? { ...defaultAdminPermissions, ...adminPermissions }
            : defaultAdminPermissions,
        navigate,
        replace,
        uploadImage,
        showAttribution
    }

    return (
        <BlogContext.Provider value={contextValue}>
            {children}
        </BlogContext.Provider>
    )
}
