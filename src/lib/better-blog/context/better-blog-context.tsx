"use client"

import React, { useMemo } from "react"
import {
    type BlogLocalization,
    blogLocalization
} from "../../../localization/blog-localization"
import type { PageComponentOverrides } from "../core/client-components"
import type { BlogDataProvider } from "../core/types"

export interface ComponentsContextValue {
    Link: React.ComponentType<{
        href: string
        children: React.ReactNode
        className?: string
    }>
    Image: React.ComponentType<{
        src: string
        alt: string
        className?: string
        width?: number
        height?: number
    }>
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
    )
}

export interface BetterBlogContextValue {
    clientConfig: BlogDataProvider
    components: ComponentsContextValue
    pageOverrides?: PageComponentOverrides
    basePath: string
    localization: BlogLocalization
    adminUiOptions?: AdminUiOptions
    navigate: typeof defaultNavigate
    replace: typeof defaultReplace
    uploadImage: (file: File) => Promise<string>
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
export interface AdminUiOptions {
    canCreate: boolean
    canUpdate: boolean
    canDelete: boolean
}

const defaultAdminUiOptions: AdminUiOptions = {
    canCreate: false,
    canUpdate: false,
    canDelete: false
}

export function useAdminUiOptions(): AdminUiOptions {
    const { adminUiOptions } = useBetterBlogContext()
    return { ...defaultAdminUiOptions, ...(adminUiOptions ?? {}) }
}

export interface BetterBlogContextProviderProps {
    clientConfig: BlogDataProvider
    components?: Partial<ComponentsContextValue> // defaults to standard HTML elements
    pageOverrides?: PageComponentOverrides
    basePath?: string // defaults to "/posts"
    localization?: Partial<BlogLocalization>
    adminUiOptions?: Partial<AdminUiOptions>
    children: React.ReactNode
    navigate?: typeof defaultNavigate
    replace?: typeof defaultReplace
    uploadImage: (file: File) => Promise<string>
}

export function BetterBlogContextProvider({
    clientConfig,
    components = defaultComponents,
    pageOverrides,
    basePath = "/posts",
    localization: localizationProp,
    adminUiOptions,
    children,
    navigate = defaultNavigate,
    replace = defaultReplace,
    uploadImage
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
        clientConfig,
        components: {
            ...defaultComponents,
            ...components
        },
        pageOverrides,
        basePath: normalizeBasePath(basePath),
        localization,
        adminUiOptions: adminUiOptions
            ? { ...defaultAdminUiOptions, ...adminUiOptions }
            : defaultAdminUiOptions,
        navigate,
        replace,
        uploadImage
    }

    return (
        <BetterBlogContext.Provider value={contextValue}>
            {children}
        </BetterBlogContext.Provider>
    )
}
