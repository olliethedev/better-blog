import { createQueryKeys } from "@lukemorales/query-key-factory"
import type { BlogDataProvider } from "../types"

export interface DraftsListParams {
    limit?: number
}

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


