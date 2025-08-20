import { act, renderHook, waitFor } from "@testing-library/react"
import { createWrapper } from "../../../../test/utils"
import type { BlogDataProvider, Post } from "../../core/types"
import { usePostSearch } from "../index"

function makePost(i: number, title = `title-${i}`): Post {
    return {
        id: `id-${i}`,
        slug: `slug-${i}`,
        title,
        content: "",
        excerpt: "",
        published: true,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: "a", name: "n" }
    }
}

describe("usePostSearch", () => {
    jest.useFakeTimers()

    test("debounces and preserves last successful results", async () => {
        const provider: BlogDataProvider = {
            async getAllPosts({ query }: { query?: string } = {}) {
                if (query === "a") return [makePost(1, "alpha")]
                if (query === "ab") return [makePost(2, "alpha beta")]
                if (query === "abc") return [makePost(3, "alpha beta gamma")]
                return []
            }
        }
        const wrapper = createWrapper(provider)
        const { result, rerender } = renderHook(
            ({ q }) => usePostSearch({ query: q, debounceMs: 200 }),
            { wrapper, initialProps: { q: "a" } }
        )

        // advance debounce and resolve first
        await act(async () => { jest.advanceTimersByTime(200) })
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.posts[0]?.title).toContain("alpha")

        // update query rapidly; lastResults should stick while loading
        rerender({ q: "ab" })
        await act(async () => { jest.advanceTimersByTime(50) })
        expect(result.current.isLoading).toBe(true)
        expect(result.current.posts[0]?.title).toContain("alpha")

        await act(async () => { jest.advanceTimersByTime(200) })
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.posts[0]?.title).toContain("alpha beta")
    })
})


