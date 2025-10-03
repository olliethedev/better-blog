import { createFileRoute } from "@tanstack/react-router"
import { BlogPageRouter } from "better-blog/client"
import { getRouteInfo, prefetchRoute, resolveSEO } from "better-blog/router"
import { blogDataProvider } from "../../lib/blog-data-provider"

// Helper to normalize path from TanStack params
function normalizePath(splat?: string): string {
  const pathSegments = splat?.split("/").filter(Boolean) || []
  return pathSegments.length ? `/${pathSegments.join("/")}` : "/"
}

export const Route = createFileRoute("/posts/$")({
    ssr: true,
    component: RouteComponent,
    loader: async ({ params, context }) => {
      const routePath = normalizePath(params._splat)
      await prefetchRoute(routePath, blogDataProvider, context.queryClient)
      return null
    },
    head: async ({ params }) => {
      const routePath = normalizePath(params._splat)
      const routeInfo = getRouteInfo(routePath)
      const seo = await resolveSEO(routeInfo, blogDataProvider)
      
      // Map SEO to TanStack head format
      const meta: Array<{ name?: string; property?: string; content?: string; title?: string }> = []
      
      if (seo.meta.title) meta.push({ title: seo.meta.title })
      if (seo.meta.description) meta.push({ name: "description", content: seo.meta.description })
      if (seo.meta.robots) meta.push({ name: "robots", content: seo.meta.robots })
      
      // Open Graph
      meta.push({
        property: "og:type",
        content: seo.meta.openGraph?.type ?? (seo.meta.openGraph?.title ? "article" : "website")
      })
      if (seo.meta.openGraph?.title ?? seo.meta.title) {
        meta.push({ property: "og:title", content: seo.meta.openGraph?.title ?? seo.meta.title })
      }
      if (seo.meta.openGraph?.description ?? seo.meta.description) {
        meta.push({ property: "og:description", content: seo.meta.openGraph?.description ?? seo.meta.description })
      }
      if (seo.meta.openGraph?.url) meta.push({ property: "og:url", content: seo.meta.openGraph.url })
      
      const ogImage = seo.meta.openGraph?.images?.[0]
      const ogImageUrl = typeof ogImage === "string" ? ogImage : ogImage?.url
      if (ogImageUrl) meta.push({ property: "og:image", content: ogImageUrl })
      
      // Twitter
      meta.push({
        name: "twitter:card",
        content: seo.meta.twitter?.card ?? (ogImageUrl ? "summary_large_image" : "summary")
      })
      if (seo.meta.twitter?.title ?? seo.meta.title) {
        meta.push({ name: "twitter:title", content: seo.meta.twitter?.title ?? seo.meta.title })
      }
      if (seo.meta.twitter?.description ?? seo.meta.description) {
        meta.push({ name: "twitter:description", content: seo.meta.twitter?.description ?? seo.meta.description })
      }
      if (ogImageUrl) meta.push({ name: "twitter:image", content: ogImageUrl })
      
      // Links
      const links: Array<{ rel: string; href: string }> = []
      if (seo.meta.canonicalUrl) links.push({ rel: "canonical", href: seo.meta.canonicalUrl })
      
      return { meta, links }
    },
})

function RouteComponent() {
  const { _splat } = Route.useParams();
  return <BlogPageRouter path={_splat} />
}

