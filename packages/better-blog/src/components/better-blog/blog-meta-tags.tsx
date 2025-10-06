"use client"

import { BlogContext } from "@/context/better-blog-context"
import { stripBasePath } from "@/lib/utils"
import { blogClientRouter } from "@/router/blog-client-router"
import { resolveSEO } from "@/router/meta-resolver"
import type { BlogDataProvider, SeoSiteConfig } from "@/types"
import React from "react"

export function BlogMetaTags({
    path,
    provider,
    site
}: {
    /** Path to compute meta tags for */
    path?: string
    /** Optional provider override, otherwise uses BlogContext */
    provider?: BlogDataProvider
    /** Optional site config for canonical, publisher, etc. */
    site?: SeoSiteConfig
}) {
    const blog = React.useContext(BlogContext)
    const [state, setState] = React.useState<{
        title?: string
        description?: string
        canonicalUrl?: string
        robots?: string
        openGraph?: {
            title?: string
            description?: string
            url?: string
            images?: Array<{ url: string } | string>
        }
        twitter?: {
            card?: "summary" | "summary_large_image"
            title?: string
            description?: string
            images?: Array<string>
        }
        structuredData: Array<Record<string, unknown>>
    }>({ structuredData: [] })

    React.useEffect(() => {
        let mounted = true
        const effectiveProvider = provider ?? blog?.dataProvider
        if (!effectiveProvider) return

        const normalizedPath = blog?.basePath
            ? stripBasePath(path ?? "/", blog.basePath)
            : (path ?? "/")
        const route = blogClientRouter.getRoute(normalizedPath)

        if (!route) return

        const type = (route.extra?.()?.type || "unknown") as import(
            "@/types"
        ).RouteType
        const routeInfo: import("@/types").RouteInfo = {
            type,
            params: route.params
        }

        resolveSEO(routeInfo, effectiveProvider, site)
            .then((seo) => {
                if (!mounted) return
                setState({ ...seo.meta, structuredData: seo.structuredData })
            })
            .catch(() => {})
        return () => {
            mounted = false
        }
    }, [path, provider, blog?.dataProvider, site, blog?.basePath])

    React.useEffect(() => {
        if (state.title) {
            try {
                document.title = state.title
            } catch {}
        }
        // Clear previous managed tags
        const managed = document.head.querySelectorAll(
            '[data-bb="seo"], [data-bb="ld"]'
        )
        for (const n of managed) {
            n.parentElement?.removeChild(n)
        }

        // Helpers
        const upsertName = (name: string, content?: string) => {
            if (!content) return
            const el = document.createElement("meta")
            el.setAttribute("name", name)
            el.setAttribute("content", content)
            el.setAttribute("data-bb", "seo")
            document.head.appendChild(el)
        }
        const upsertProp = (property: string, content?: string) => {
            if (!content) return
            const el = document.createElement("meta")
            el.setAttribute("property", property)
            el.setAttribute("content", content)
            el.setAttribute("data-bb", "seo")
            document.head.appendChild(el)
        }
        const upsertLink = (rel: string, href?: string) => {
            if (!href) return
            const el = document.createElement("link")
            el.setAttribute("rel", rel)
            el.setAttribute("href", href)
            el.setAttribute("data-bb", "seo")
            document.head.appendChild(el)
        }

        // Basics
        upsertName("description", state.description)
        upsertName("robots", state.robots)
        upsertLink("canonical", state.canonicalUrl)

        // Open Graph
        const ogTitle = state.openGraph?.title ?? state.title
        const ogDesc = state.openGraph?.description ?? state.description
        const ogUrl = state.openGraph?.url
        const ogImage = state.openGraph?.images?.[0]
        const ogImageUrl = typeof ogImage === "string" ? ogImage : ogImage?.url
        upsertProp("og:type", state.openGraph?.title ? "article" : "website")
        upsertProp("og:title", ogTitle)
        upsertProp("og:description", ogDesc)
        upsertProp("og:url", ogUrl)
        upsertProp("og:image", ogImageUrl)

        // Twitter
        upsertName(
            "twitter:card",
            state.twitter?.card ??
                (ogImageUrl ? "summary_large_image" : "summary")
        )
        upsertName("twitter:title", state.twitter?.title ?? state.title)
        upsertName(
            "twitter:description",
            state.twitter?.description ?? state.description
        )
        upsertName("twitter:image", ogImageUrl)

        // JSON-LD
        for (const obj of state.structuredData) {
            try {
                const s = document.createElement("script")
                s.type = "application/ld+json"
                s.setAttribute("data-bb", "ld")
                s.text = JSON.stringify(obj)
                document.head.appendChild(s)
            } catch {}
        }
    }, [
        state.title,
        state.description,
        state.canonicalUrl,
        state.robots,
        state.openGraph?.title,
        state.openGraph?.description,
        state.openGraph?.url,
        state.openGraph?.images,
        state.twitter?.card,
        state.twitter?.title,
        state.twitter?.description,
        state.structuredData
    ])
    return null
}
