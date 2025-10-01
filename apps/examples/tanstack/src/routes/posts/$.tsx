import { createFileRoute } from "@tanstack/react-router"
import { BlogMetaTags, BlogPageRouter } from "better-blog/client"
import { matchRoute } from "better-blog/router"
import { prefetchBlogData } from "better-blog/server/pages"

import { blogDataProvider } from "../../lib/blog-data-provider"


export const Route = createFileRoute("/posts/$")({
    ssr: true,
    // Head is now handled via <BlogMetaTags> in the component for better DX
    component: RouteComponent,
    loader: async ({ params, context }) => {
      const routeMatch = matchRoute(params._splat?.split("/").filter(Boolean))
      await prefetchBlogData({
        match: routeMatch,
        provider: blogDataProvider,
        queryClient: context.queryClient,
      })
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

