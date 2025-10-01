import { getProvider } from "@/lib/providers"
import { getOrCreateQueryClient } from "@/lib/query-client"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { BlogPageRouter } from "better-blog/client"
import { matchRoute } from "better-blog/router"
import { prefetchBlogData } from "better-blog/server/pages"

// Create query client for React Query
const queryClient = getOrCreateQueryClient()

// // Create the server adapter
// const serverAdapter = createBlogServerAdapter({
//     // Must be a promise or value; we resolve provider at runtime
//     provider: await getProvider(),
//     queryClient
// })

// // Export the required Next.js functions
// export const generateStaticParams = serverAdapter.generateStaticParams
// export const generateMetadata: (context: {
//     params: Promise<{ all: string[] | undefined }>
// }) => Promise<Metadata> = async ({ params }) => {
//     const { all } = await params
//     return serverAdapter.generateNextMetadata(
//         all?.join("/")
//     ) as unknown as Metadata
// }

// Main page component
export default async function BlogPage({
    params
}: {
    params: Promise<{ all: string[] | undefined }>
}) {
    const { all } = await params
    // const { BlogServerRouter } = serverAdapter

    // return <BlogServerRouter path={all?.join("/")} />
    const routeMatch = matchRoute(all?.join("/").split("/").filter(Boolean))
    await prefetchBlogData({
        match: routeMatch,
        provider: await getProvider(),
        queryClient
    })
    const dehydratedState = dehydrate(queryClient)
    return <HydrationBoundary state={dehydratedState}>
    
    <BlogPageRouter path={all?.join("/")} />
</HydrationBoundary>
}
