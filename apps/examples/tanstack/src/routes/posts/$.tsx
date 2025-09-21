import { createFileRoute } from "@tanstack/react-router"
import { createBlogServerAdapter } from "better-blog/server/pages";
import { BlogPageRouter } from "better-blog/client"

import { blogDataProvider } from "../../lib/blog-data-provider";


export const Route = createFileRoute("/posts/$")({
    ssr: true,
    head: ({ loaderData }) => {
      const meta = (loaderData ?? null) as
        | {
            title?: string
            description?: string
            openGraph?: { title?: string; description?: string; images?: Array<{ url: string } | string> }
            twitter?: { card?: string; title?: string; description?: string; images?: Array<string> }
          }
        | null

      const ogImage = meta?.openGraph?.images?.[0]
      const ogImageUrl = typeof ogImage === "string" ? ogImage : ogImage?.url

      return {
        meta: [
          meta?.title ? { title: meta.title } : undefined,
          meta?.description
            ? { name: "description", content: meta.description }
            : undefined,
          // Open Graph
          { property: "og:type", content: "article" },
          meta?.openGraph?.title
            ? { property: "og:title", content: meta.openGraph.title }
            : meta?.title
            ? { property: "og:title", content: meta.title }
            : undefined,
          meta?.openGraph?.description
            ? { property: "og:description", content: meta.openGraph.description }
            : meta?.description
            ? { property: "og:description", content: meta.description }
            : undefined,
          ogImageUrl ? { property: "og:image", content: ogImageUrl } : undefined,
          // Twitter
          meta?.twitter?.card
            ? { name: "twitter:card", content: meta.twitter.card }
            : { name: "twitter:card", content: ogImageUrl ? "summary_large_image" : "summary" },
          meta?.twitter?.title
            ? { name: "twitter:title", content: meta.twitter.title }
            : meta?.title
            ? { name: "twitter:title", content: meta.title }
            : undefined,
          meta?.twitter?.description
            ? { name: "twitter:description", content: meta.twitter.description }
            : meta?.description
            ? { name: "twitter:description", content: meta.description }
            : undefined,
          ogImageUrl ? { name: "twitter:image", content: ogImageUrl } : undefined,
        ].filter(Boolean) as Array<{ name?: string; property?: string; content?: string; title?: string }>,
      }
    },
    component: RouteComponent,
    loader: async ({ params, context }) => {
      const serverAdapter = createBlogServerAdapter({
        provider: blogDataProvider,
        queryClient: context.queryClient,
      })
      await serverAdapter.prefetch({ path: params._splat })
      const meta = await serverAdapter.generateMetadata(params._splat)
      return meta
    }
})

function RouteComponent() {
  const { _splat } = Route.useParams();
  return <BlogPageRouter path={_splat} />
}

