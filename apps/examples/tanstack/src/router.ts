import { QueryClient } from '@tanstack/react-query'
// src/router.tsx
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'
// The root route is defined in `routes/__root.tsx`

export interface MyRouterContext {
  queryClient: QueryClient
}

export function createRouter() {
  // Ensure a fresh QueryClient per request in SSR environments
  const queryClient = new QueryClient()

  const router = createTanStackRouter({
    routeTree,
    // optionally expose the QueryClient via router context
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    // optional:
    // handleRedirects: true,
    // wrapQueryClient: true,
  })

  return router
}

// TanStack Start requires getRouter to be exported
export function getRouter() {
  return createRouter()
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}