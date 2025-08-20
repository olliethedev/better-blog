import { renderHook, waitFor } from "@testing-library/react"
import { createWrapper } from "../../../../test/utils"
import type { BlogDataProvider, Post } from "../../core/types"
import { useTagPosts } from "../index"

function makePost(i: number, tag?: string): Post {
    return {
        id: `id-${i}`,
        slug: `slug-${i}`,
        title: `title-${i}`,
        content: "",
        excerpt: "",
        published: true,
        tags: tag ? [{ id: tag, slug: tag, name: tag }] : [],
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: "a", name: "n" }
    }
}

describe("useTagPosts", () => {
    test("fetches posts filtered by tag and respects enabled flag", async () => {
        const provider: BlogDataProvider = {
            async getAllPosts({ tag, offset = 0, limit = 10 } = {}) {
                if (!tag) return []
                // return a single page to keep it simple
                if (offset === 0) return Array.from({ length: limit }, (_, i) => makePost(i, tag))
                return []
            }
        }

        const wrapper = createWrapper(provider)

        // disabled when tag is undefined
        const { result: r1 } = renderHook(() => useTagPosts(undefined), { wrapper })
        await waitFor(() => expect(r1.current.isLoading).toBe(false))
        expect(r1.current.posts).toHaveLength(0)

        // enabled when tag provided
        const { result: r2 } = renderHook(() => useTagPosts("react"), { wrapper })
        await waitFor(() => expect(r2.current.isLoading).toBe(false))
        expect(r2.current.posts).toHaveLength(10)
        expect(r2.current.posts.every(p => p.tags.some(t => t.id === "react"))).toBe(true)
    })
})


