import { act, renderHook, waitFor } from "@testing-library/react"
import { createWrapper } from "../../../../test/utils"
import type { BlogDataProvider, Post } from "../../core/types"
import { usePosts } from "../index"

function makePost(i: number): Post {
    return {
        id: `id-${i}`,
        slug: `slug-${i}`,
        title: `title-${i}`,
        content: "",
        excerpt: "",
        published: true,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: "a", name: "n" }
    }
}

describe("usePosts", () => {
    test("loads first page and paginates", async () => {
        const pageSize = 10
        const page0 = Array.from({ length: pageSize }, (_, i) => makePost(i))
        const page1 = Array.from({ length: pageSize }, (_, i) => makePost(i + pageSize))
        const provider: BlogDataProvider = {
            async getAllPosts({ offset = 0, limit = pageSize } = {}) {
                if (offset === 0) return page0
                if (offset === pageSize) return page1
                return []
            }
        }
        const wrapper = createWrapper(provider)
        const { result } = renderHook(() => usePosts({ limit: pageSize }), {
            wrapper
        })

        expect(result.current.isLoading).toBe(true)
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.posts).toHaveLength(pageSize)

        await act(async () => {
            await result.current.loadMore()
        })
        await waitFor(() => expect(result.current.posts).toHaveLength(pageSize * 2))
    })
})


