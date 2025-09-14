import type { Post } from "@/types"
import type { BlogDataProvider } from "@/types"
import { renderHook, waitFor } from "@testing-library/react"
import { createWrapper } from "../../test/utils"
import { usePost } from "../index"

function makePost(slug: string): Post {
    return {
        id: slug,
        slug,
        title: slug,
        content: "",
        excerpt: "",
        published: true,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: "a", name: "n" }
    }
}

describe("usePost", () => {
    test("returns null when slug missing", async () => {
        const provider: BlogDataProvider = {
            async getAllPosts() {
                return []
            }
        }
        const wrapper = createWrapper(provider)
        const { result } = renderHook(() => usePost(undefined), { wrapper })
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.post).toBeNull()
    })

    test("prefers getPostBySlug, falls back to getAllPosts", async () => {
        const slug = "s1"
        const provider: BlogDataProvider = {
            async getAllPosts() {
                return [makePost(slug)]
            },
            async getPostBySlug() {
                return null
            }
        }
        const wrapper = createWrapper(provider)
        const { result } = renderHook(() => usePost(slug), { wrapper })
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.post?.slug).toBe(slug)
    })
})


