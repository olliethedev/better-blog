import { getProvider } from "@/lib/providers"
import { getOrCreateQueryClient } from "@/lib/query-client"
import { createBlogServerAdapter } from "better-blog/server/pages"
import type { Metadata } from "next"

// Create query client for React Query
const queryClient = getOrCreateQueryClient()

console.log("queryClient!", queryClient)

// Create the server adapter
const serverAdapter = createBlogServerAdapter({
    // Must be a promise or value; we resolve provider at runtime
    provider: await getProvider(),
    queryClient
})

// Export the required Next.js functions
export const generateStaticParams = serverAdapter.generateStaticParams
export const generateMetadata: (context: {
    params: Promise<{ all: string[] | undefined }>
}) => Promise<Metadata> = async ({ params }) => {
    const { all } = await params
    return serverAdapter.generateMetadata(all?.join("/"))
}

// Main page component
export default async function BlogPage({
    params
}: {
    params: Promise<{ all: string[] | undefined }>
}) {
    const { all } = await params
    const { BlogServerRouter } = serverAdapter

    return <BlogServerRouter path={all?.join("/")} />
}
