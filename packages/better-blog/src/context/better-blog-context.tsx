"use client"

import { DEFAULT_API_BASE_PATH, DEFAULT_PAGES_BASE_PATH } from "@/lib/constants"
import React, { useMemo } from "react"
import { normalizeBasePath } from "../lib/utils"
import {
    type BlogLocalization,
    blogLocalization
} from "../localization/blog-localization"
import { createBlogApiProvider } from "../providers/api/api-provider"
import {
    defaultAdminPermissions,
    defaultNavigate,
    defaultReplace,
    defaultUIComponents
} from "./defaults"
import type { BlogContextType, BlogProviderProps } from "./types"


export const BlogContext = React.createContext<BlogContextType | null>(null)

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
