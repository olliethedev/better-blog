import type { RouteMatch } from "@/types"
import { matchPattern, resolveMetadata } from "./route-schema"
import { routeSchema } from "./routes"

export function matchRoute(
    pathSegments?: string[],
    basePath?: string
): RouteMatch {
    const normalizedSlug = pathSegments || []

    //remove basePath from pathSegments
    if (
        basePath &&
        normalizedSlug[0] === basePath.split("/").filter(Boolean)[0]
    ) {
        normalizedSlug.shift()
    }

    // Try to match against each route in the schema and pick the most specific (fewest dynamic segments)
    let bestMatch:
        | {
              routeType: RouteMatch["type"]
              params: Record<string, string>
              metadata: RouteMatch["metadata"]
              specificityScore: number // higher is more specific (more static segments)
              orderIndex: number // to keep stable order when scores tie
          }
        | undefined

    for (let index = 0; index < routeSchema.routes.length; index++) {
        const routeDef = routeSchema.routes[index]
        const { matches, params } = matchPattern(
            normalizedSlug,
            routeDef.pattern
        )
        if (!matches) continue

        // Specificity: count static segments in the pattern
        const specificityScore = routeDef.pattern.reduce(
            (count, segment) => (segment.startsWith(":") ? count : count + 1),
            0
        )

        const metadata = resolveMetadata(routeDef, params)
        const currentMatch = {
            routeType: routeDef.type as RouteMatch["type"],
            params,
            metadata,
            specificityScore,
            orderIndex: index
        }

        if (
            !bestMatch ||
            currentMatch.specificityScore > bestMatch.specificityScore ||
            (currentMatch.specificityScore === bestMatch.specificityScore &&
                currentMatch.orderIndex < bestMatch.orderIndex)
        ) {
            bestMatch = currentMatch
        }
    }

    if (bestMatch) {
        return {
            type: bestMatch.routeType,
            params: bestMatch.params,
            metadata: bestMatch.metadata
        }
    }

    // Fallback for unknown routes
    return {
        type: "unknown",
        metadata: {
            title: `Unknown route: /${normalizedSlug.join("/")}`
        }
    }
}
