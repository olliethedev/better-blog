import { ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { type BlogUIComponents, BlogProvider } from "better-blog/context";
import { getOrCreateQueryClient } from "better-blog/queries";

const components: BlogUIComponents = {
  Link: ({ href, children, className }) => (
    <Link to={href} className={className}>
      {children}
    </Link>
  ),
  Image: ({ src, alt, className, width, height }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width || 800}
      height={height || 400}
    />
  ),
};


export function Provider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <BlogProvider
        localization={{
          BLOG_LIST_TITLE: "Blog Posts",
        }}
        components={components}
        adminPermissions={{
          canCreate:true,
          canUpdate:true,
          canDelete:true
        }}
        navigate={(href) => router.navigate({ href })}
        replace={(href) => router.navigate({ href, replace: true })}
        uploadImage={async (file) => {
          console.log("uploadImage", file);
          //fake wait
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return "https://placehold.co/400";
        }}
      >
        {children}
      </BlogProvider>
  );
}
