import type { BlogDataProvider } from "@/types"
import { createQueryKeys } from "@lukemorales/query-key-factory"
import type { DraftsListParams } from "./types"

export function createDraftsQueries(provider: BlogDataProvider) {
    return createQueryKeys("drafts", {
        list: (params?: DraftsListParams) => ({
            queryKey: [
                {
                    ...(params?.limit && { limit: params.limit })
                }
            ],
            queryFn: async ({ pageParam }: { pageParam?: number }) => {
                return provider.getAllPosts({
                    offset: pageParam ?? 0,
                    limit: params?.limit ?? 10,
                    published: false
                })
            }
        })
    })
}
