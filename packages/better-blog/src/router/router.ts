import type { RouteMatch } from "@/types"
import { blogRouter } from "./blog-router"

/**
 * Match a route based on path segments and return route information
 * Uses yar's synchronous getRoute (v1.0.3+) for route matching
 */
export function matchRoute(
    pathSegments?: string[],
    basePath?: string
): RouteMatch {
    const normalizedSlug = pathSegments || []

    if (
        basePath &&
        normalizedSlug[0] === basePath.split("/").filter(Boolean)[0]
    ) {
        normalizedSlug.shift()
    }

    const path = normalizedSlug.length ? `/${normalizedSlug.join("/")}` : "/"

    // Use yar's synchronous getRoute to match the route
    const route = blogRouter.getRoute(path)

    if (route) {
        const { meta, params, extra } = route
        const metaTags = meta ? meta() : []

        // Extract title and description from meta tags
        const titleTag = metaTags.find(
            (
                tag: React.JSX.IntrinsicElements["meta"] | undefined
            ): tag is React.JSX.IntrinsicElements["meta"] =>
                tag !== undefined && "name" in tag && tag.name === "title"
        )
        const descriptionTag = metaTags.find(
            (
                tag: React.JSX.IntrinsicElements["meta"] | undefined
            ): tag is React.JSX.IntrinsicElements["meta"] =>
                tag !== undefined && "name" in tag && tag.name === "description"
        )

        const title =
            (titleTag && "content" in titleTag
                ? titleTag.content
                : undefined) || "Untitled"
        const description =
            descriptionTag && "content" in descriptionTag
                ? descriptionTag.content
                : undefined

        // Determine route type from path and params
        const type = extra?.type || "unknown"

        return {
            type,
            params,
            metadata: {
                title,
                description
            }
        }
    }

    // Return unknown route if no match
    return {
        type: "unknown",
        metadata: {
            title: `Unknown route: ${path}`
        }
    }
}

/**
 * Export the blog router for advanced use cases
 */
export { blogRouter } from "./blog-router"
