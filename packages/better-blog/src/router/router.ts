import type { RouteMatch } from "@/types"
import {
    addRoute as addRou3Route,
    createRouter as createRou3Router,
    findRoute as rou3FindRoute
} from "rou3"
import { routeSchema } from "./routes"
import type { RouteDefinition } from "./types"

// Build a singleton rou3 router from our route schema
const __rou3Router = (() => {
    const router = createRou3Router<RouteDefinition>()
    for (let index = 0; index < routeSchema.routes.length; index++) {
        const routeDef = routeSchema.routes[index]
        const path = routeDef.pattern.length
            ? `/${routeDef.pattern.join("/")}`
            : "/"
        // Store routeDef in payload for selection
        addRou3Route(router, "GET", path, routeDef)
    }
    return router
})()

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

    // Find all potential matches via rou3, then pick the most specific
    const match = rou3FindRoute<RouteDefinition>(__rou3Router, "GET", path)
    if (match) {
        return {
            type: match.data.type,
            params: match.params,
            metadata: resolveMetadata(match.data, match.params ?? {})
        }
    }

    return {
        type: "unknown",
        metadata: {
            title: `Unknown route: ${path}`
        }
    }
} /**
 * Resolves metadata from route definition, handling both static and dynamic values
 */

function resolveMetadata(
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
