import { memoryProvider } from "@/lib/providers/memory"
import { getSqlProvider } from "@/lib/providers/sql"
import { createBlogApiRouter } from "better-blog/api"

async function getProvider() {
    const choice = process.env.BETTER_BLOG_PROVIDER || "memory"
    if (choice === "sql" || choice === "kysely" || choice === "postgres") {
        return await getSqlProvider()
    }
    return memoryProvider
}

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