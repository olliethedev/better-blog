import { BlogMetaTags, BlogPageRouter } from "better-blog/client"
import { matchRoute } from "better-blog/router"
import { useLocation } from "react-router-dom"
import { useBlogDataProvider } from "./useBlogDataProvider"

export default function BlogEntryPage() {
  const location = useLocation()

  const dataProvider = useBlogDataProvider()
  const routeMatch = matchRoute(
    location.pathname.split("/").filter(Boolean),
    "/posts"
  )

  return (
    <main >
      {dataProvider && (
        <BlogMetaTags routeMatch={routeMatch} provider={dataProvider} />
      )}
      <BlogPageRouter path={location.pathname} />
    </main>
  )
}