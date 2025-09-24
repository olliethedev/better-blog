
import { QueryClientProvider } from "@tanstack/react-query";
import { BlogProvider } from "better-blog/context";
import type { BlogUIComponents } from "better-blog/context";
import { getOrCreateQueryClient } from "better-blog/queries";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom"
import { ThemeProvider } from "./theme-provider";
import { useBlogDataProvider } from "./useBlogDataProvider";

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
  const dataProvider = useBlogDataProvider()

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

