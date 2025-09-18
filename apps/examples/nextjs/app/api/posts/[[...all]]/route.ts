import { getProvider } from "@/lib/providers"
import { createBlogApiRouter } from "better-blog/api"


const providerPromise = getProvider()
const { handler } = createBlogApiRouter({
    // Lazy resolve inside handler to ensure env is available at runtime
    // but we cache the promise above to avoid re-creating
    provider: await providerPromise,
    openapi: { disabled: false }
})

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler