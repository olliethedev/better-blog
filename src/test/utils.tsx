import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type React from "react"
import { BlogProvider } from "../lib/better-blog/context/better-blog-context"
import type { BlogDataProvider } from "../lib/better-blog/core/types"

export function createWrapper(
    provider: BlogDataProvider,
    customQueryClient?: QueryClient
) {
    const queryClient =
        customQueryClient ||
        new QueryClient({
            defaultOptions: { queries: { retry: false } }
        })

    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <BlogProvider
                    dataProvider={provider}
                    uploadImage={async () => ""}
                >
                    {children}
                </BlogProvider>
            </QueryClientProvider>
        )
    }
}


