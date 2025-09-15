import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Simple, dependency-free throttle with cancel/flush helpers
// Behavior: leading and trailing enabled by default
export function throttle<Args extends unknown[]>(
    callback: (...args: Args) => void,
    waitMs: number
) {
    let timerId: ReturnType<typeof setTimeout> | null = null
    let lastInvokeTime = 0
    let trailingArgs: Args | null = null

    const invoke = (args: Args) => {
        lastInvokeTime = Date.now()
        callback(...args)
    }

    const throttled = (...args: Args) => {
        const now = Date.now()
        const remaining = waitMs - (now - lastInvokeTime)

        // Leading edge
        if (lastInvokeTime === 0) {
            invoke(args)
            return
        }

        if (remaining <= 0 || remaining > waitMs) {
            if (timerId) {
                clearTimeout(timerId)
                timerId = null
            }
            invoke(args)
        } else {
            // Schedule trailing edge
            trailingArgs = args
            if (!timerId) {
                timerId = setTimeout(() => {
                    timerId = null
                    if (trailingArgs) {
                        invoke(trailingArgs)
                        trailingArgs = null
                    }
                }, remaining)
            }
        }
    }

    throttled.cancel = () => {
        if (timerId) {
            clearTimeout(timerId)
            timerId = null
        }
        trailingArgs = null
        lastInvokeTime = 0
    }

    throttled.flush = () => {
        if (timerId && trailingArgs) {
            clearTimeout(timerId)
            timerId = null
            invoke(trailingArgs)
            trailingArgs = null
        }
    }

    return throttled as ((...args: Args) => void) & {
        cancel: () => void
        flush: () => void
    }
}

export function normalizeBasePath(path: string): string {
    const withLeading = path.startsWith("/") ? path : `/${path}`
    return withLeading !== "/" && withLeading.endsWith("/")
        ? withLeading.slice(0, -1)
        : withLeading
}

export function normalizeBaseURL(url: string): string {
    let normalizedURL = url
    // if does not start with http:// or https://, add http://
    if (
        !normalizedURL.startsWith("http://") &&
        !normalizedURL.startsWith("https://")
    ) {
        normalizedURL = `http://${url}`
    }
    // remove trailing slash if it exists
    if (normalizedURL.endsWith("/")) {
        normalizedURL = normalizedURL.slice(0, -1)
    }
    return normalizedURL
}

export function joinPaths(...segments: string[]): string {
    const cleaned = segments
        .filter((s) => s != null && s !== "")
        .map((s, i) => (i === 0 ? s.replace(/\/$/, "") : s.replace(/^\//, "")))
    const joined = cleaned.join("/")
    return joined.startsWith("http")
        ? joined
        : `/${joined}`.replace(/\/+/g, "/")
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
