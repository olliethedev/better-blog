import { BlogMetaTags, BlogPageRouter } from "better-blog/client"
import { useLocation } from "react-router-dom"
import { useBlogDataProvider } from "./useBlogDataProvider"

export default function BlogEntryPage() {
  const location = useLocation()
  const dataProvider = useBlogDataProvider()

  return (
    <main >
      {dataProvider && (
        <BlogMetaTags path={location.pathname} provider={dataProvider} />
      )}
      <BlogPageRouter path={location.pathname} />
    </main>
  )
}