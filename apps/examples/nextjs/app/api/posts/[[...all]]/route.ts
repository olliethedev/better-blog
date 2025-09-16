import { memoryProvider } from "@/lib/providers/memory"
import { createBlogApiRouter } from "better-blog/api"

const { handler } = createBlogApiRouter({
  provider: memoryProvider,
  openapi: { disabled: false },
});
  
  export const GET = handler;
  export const POST = handler;
  export const PUT = handler;
  export const DELETE = handler;