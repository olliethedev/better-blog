import {
    type AdminPermissions,
    type BlogComponents,
    type BlogContextType,
    type RouteContextValue,
    defaultAdminPermissions
} from "@/context"
import { BlogContext } from "@/context/better-blog-context"
import { RouteContext } from "@/context/route-context"
import { buildPath } from "@/lib/utils"
import type { PageComponentOverrides } from "@/types"
import React from "react"

export interface Foo {
    bar: string
}
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
export function useAdminPermissions(): AdminPermissions {
    const { adminPermissions } = useBlogContext()
    return { ...defaultAdminPermissions, ...(adminPermissions ?? {}) }
}
export function useRoute(): RouteContextValue {
    const context = React.useContext(RouteContext)
    if (!context) {
        throw new Error("useRoute must be used within a RouteProvider")
    }
    return context
}
