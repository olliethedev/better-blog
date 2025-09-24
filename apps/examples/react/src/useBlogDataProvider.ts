import type { BlogDataProvider } from "better-blog"
import { createBlogApiProvider } from "better-blog/providers/api"
import { createSeededMemoryProvider } from "better-blog/providers/memory"
import { useEffect, useState } from "react"

export function useBlogDataProvider(): BlogDataProvider | null {
  const [dataProvider, setDataProvider] = useState<BlogDataProvider | null>(null)

  useEffect(() => {
    let active = true
    const mode = import.meta.env?.VITE_BLOG_PROVIDER ?? "memory"
    if (mode === "api") {
      const baseURL = import.meta.env?.VITE_API_BASE_URL ?? ""
      const basePath = import.meta.env?.VITE_API_BASE_PATH ?? "/api/posts"
      const provider = createBlogApiProvider({ baseURL, basePath })
      if (active) setDataProvider(provider)
    } else {
      createSeededMemoryProvider().then((provider) => {
        if (active) setDataProvider(provider)
      })
    }
    return () => {
      active = false
    }
  }, [])

  return dataProvider
}


