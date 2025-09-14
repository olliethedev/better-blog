import type { RouteDefinition } from "./types"

/**
 * Matches a URL slug array against route patterns
 */
export function matchPattern(
    slug: string[],
    pattern: (string | ":slug" | ":tag" | ":id")[]
): {
    matches: boolean
    params: Record<string, string>
} {
    if (slug.length !== pattern.length) {
        return { matches: false, params: {} }
    }

    const params: Record<string, string> = {}

    for (let i = 0; i < pattern.length; i++) {
        const patternSegment = pattern[i]
        const slugSegment = slug[i]

        if (patternSegment.startsWith(":")) {
            // Dynamic segment - extract parameter
            const paramName = patternSegment.slice(1)
            params[paramName] = slugSegment
        } else if (patternSegment !== slugSegment) {
            // Static segment must match exactly
            return { matches: false, params: {} }
        }
    }

    return { matches: true, params }
}

/**
 * Resolves metadata from route definition, handling both static and dynamic values
 */
export function resolveMetadata(
    routeDef: RouteDefinition,
    params: Record<string, string>
): { title: string; description?: string; image?: string } {
    const resolveValue = (
        value: string | ((params: Record<string, string>) => string) | undefined
    ): string | undefined => {
        if (typeof value === "function") {
            return value(params)
        }
        return value
    }

    return {
        title: resolveValue(routeDef.metadata.title) || "Untitled",
        description: resolveValue(routeDef.metadata.description),
        image: resolveValue(routeDef.metadata.image)
    }
}
