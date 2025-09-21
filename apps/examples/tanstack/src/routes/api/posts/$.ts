import { createServerFileRoute } from "@tanstack/react-start/server"

import { createBlogApiRouter } from "better-blog/api"
import { blogDataProvider } from "@/lib/blog-data-provider"

const { handler } = createBlogApiRouter({
    provider: blogDataProvider,
    basePath: '/api/posts',
    openapi: {
        disabled: false,
    },
  });


export const ServerRoute = createServerFileRoute("/api/posts/$").methods({
    GET: async ({ request }) => {
        return handler(request)
      },
      POST: async ({ request }) => {
        return handler(request)
      },
      PUT: async ({ request }) => {
        return handler(request)
      },
      DELETE: async ({ request }) => {
        return handler(request)
      },
  })