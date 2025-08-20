import { act, renderHook, waitFor } from "@testing-library/react"
import { createWrapper } from "../../../../test/utils"
import type { BlogDataProvider, Post } from "../../core/types"
import { useDrafts } from "../index"

function makePost(i: number, published: boolean): Post {
    return {
        id: `id-${i}`,
        slug: `slug-${i}`,
        title: `title-${i}`,
        content: "",
        excerpt: "",
        published,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: "a", name: "n" }
    }
}

describe("useDrafts", () => {
    test("filters unpublished and paginates", async () => {
        const pageSize = 10
        const page0 = [
            ...Array.from({ length: pageSize / 2 }, (_, i) => makePost(i, false)),
            ...Array.from({ length: pageSize / 2 }, (_, i) => makePost(i + 100, true))
        ]
        const page1 = Array.from({ length: pageSize }, (_, i) => makePost(i + 200, false))
        const provider: BlogDataProvider = {
            async getAllPosts({ offset = 0 } = {}) {
                if (offset === 0) return page0
                if (offset === pageSize) return page1
                return []
            }
        }
        const wrapper = createWrapper(provider)
        const { result } = renderHook(() => useDrafts(), { wrapper })
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.drafts.every((p) => !p.published)).toBe(true)
        const firstLen = result.current.drafts.length
        await act(async () => { await result.current.loadMore() })
        await waitFor(() => expect(result.current.drafts.length).toBeGreaterThan(firstLen))
    })
})


