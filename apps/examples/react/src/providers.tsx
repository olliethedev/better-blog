
import { QueryClientProvider } from "@tanstack/react-query";
import type { BlogDataProvider } from "better-blog";
import { BlogProvider } from "better-blog/context";
import type { BlogUIComponents } from "better-blog/context";
import { createBlogApiProvider } from "better-blog/providers/api";
import { createSeededMemoryProvider } from "better-blog/providers/memory";
import { getOrCreateQueryClient } from "better-blog/queries";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"
import { ThemeProvider } from "./theme-provider";

// Use the library's seeded in-memory provider for demo/e2e

const components: BlogUIComponents = {
  Link: ({ href, children, className }) => (
    <NavLink to={href} className={className}>
      {children}
    </NavLink>
  ),
  Image: ({ src, alt, className }) => (
    <img src={src} alt={alt} className={className} />
  ),
};


export function Provider({ children }: { children: ReactNode }) {
  const queryClient = getOrCreateQueryClient()
  const navigate = useNavigate()
  const [dataProvider, setDataProvider] = useState<BlogDataProvider | null>(null)

  useEffect(() => {
    let active = true
    const mode = import.meta.env?.VITE_BLOG_PROVIDER || (typeof process !== 'undefined' ? process.env.BETTER_BLOG_PROVIDER : undefined) || 'memory'
    if (mode === 'api') {
      const baseURL = '' // same origin
      const basePath = import.meta.env?.VITE_API_BASE_PATH || (typeof process !== 'undefined' ? process.env.API_BASE_PATH : undefined) || '/api/posts'
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

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {dataProvider && (
          <BlogProvider
            localization={{
              BLOG_LIST_TITLE: "Blog Posts",
            }}
            dataProvider={dataProvider}
            components={components}
            navigate={navigate}
            basePath="/posts"
            adminPermissions={{
              canCreate: true,
              canUpdate: true,
              canDelete: true
            }}
            uploadImage={async (file) => {
              console.log("uploadImage", file);
              return "https://via.placeholder.com/150/png";
            }}
          >
            {children}
          </BlogProvider>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

