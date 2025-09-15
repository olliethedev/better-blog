import type { Post } from "@/types"
import type { BlogDataProvider } from "@/types"
import type { Tag } from "@/types"
import { renderHook, waitFor } from "@testing-library/react"
import { createWrapper } from "../../test/utils"
import { useTags } from "../index"

function makePostWithTags(id: number, tags: Tag[]): Post {
    return {
        id: `id-${id}`,
        slug: `slug-${id}`,
        title: `title-${id}`,
        content: "",
        excerpt: "",
        published: true,
        tags,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: "a", name: "n" }
    }
}

describe("useTags", () => {
    test("aggregates, dedupes and sorts tags", async () => {
        const t = (i: number): Tag => ({
            id: `t${i}`,
            slug: `t${i}`,
            name: `tag${i}`
        })
        const provider: BlogDataProvider = {
            async getAllPosts({ offset = 0, limit = 50 } = {}) {
                if (offset === 0) return [makePostWithTags(1, [t(2), t(1)])]
                if (offset === 50) return [makePostWithTags(2, [t(1), t(3)])]
                return []
            }
        }
        const wrapper = createWrapper(provider)
        const { result } = renderHook(() => useTags(), { wrapper })
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.tags.map((x) => x.id)).toEqual(["t1", "t2", "t3"]) // sorted by name
    })
})


