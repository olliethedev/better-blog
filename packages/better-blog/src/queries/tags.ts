import type { Post } from "@/types"
import type { BlogDataProvider } from "@/types"
import type { Tag } from "@/types"
import { createQueryKeys } from "@lukemorales/query-key-factory"

export function createTagsQueries(provider: BlogDataProvider) {
    return createQueryKeys("tags", {
        list: {
            queryKey: null,
            queryFn: async (): Promise<Tag[]> => {
                const pageSize = 50
                let offset = 0
                const uniqueTagsById = new Map<string, Tag>()

                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const posts = (await provider.getAllPosts({
                        offset,
                        limit: pageSize
                    })) as Post[]
                    if (!posts || posts.length === 0) break
                    for (const post of posts) {
                        if (Array.isArray(post.tags)) {
                            for (const tag of post.tags) {
                                if (
                                    tag &&
                                    typeof tag.id === "string" &&
                                    !uniqueTagsById.has(tag.id)
                                ) {
                                    uniqueTagsById.set(tag.id, tag)
                                }
                            }
                        }
                    }
                    offset += pageSize
                }
                return Array.from(uniqueTagsById.values()).sort((a, b) =>
                    a.name.localeCompare(b.name)
                )
            }
        }
    })
}
