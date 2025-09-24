import { createFileRoute } from "@tanstack/react-router"
import { BlogMetaTags, BlogPageRouter } from "better-blog/client"
import { createBlogServerAdapter } from "better-blog/server/pages";

import { blogDataProvider } from "../../lib/blog-data-provider";


export const Route = createFileRoute("/posts/$")({
    ssr: true,
    // Head is now handled via <BlogMetaTags> in the component for better DX
    component: RouteComponent,
    loader: async ({ params, context }) => {
      const serverAdapter = createBlogServerAdapter({
        provider: blogDataProvider,
        queryClient: context.queryClient,
      })
      await serverAdapter.prefetch({ path: params._splat })
      return null
    }
})

function RouteComponent() {
  const { _splat } = Route.useParams();
  return (
    <>
      <BlogMetaTags path={_splat} provider={blogDataProvider} />
      <BlogPageRouter path={_splat} />
    </>
  )
}

