import { BlogPageRouter } from "better-blog/client"
import { useLocation } from "react-router-dom"

export default function BlogEntryPage() {
  const location = useLocation()

  return (
    <main >
      <BlogPageRouter path={location.pathname} />
    </main>
  )
}