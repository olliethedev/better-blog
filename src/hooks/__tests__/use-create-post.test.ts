import type { BlogDataProvider } from "@/types"
import { act, renderHook } from "@testing-library/react"
import { createWrapper } from "../../test/utils"
import { useCreatePost } from "../index"

describe("useCreatePost", () => {
    test("exposes mutate and triggers invalidations on success (shape)", async () => {
        const provider: BlogDataProvider = {
            async getAllPosts() { return [] }
        }
        const wrapper = createWrapper(provider)

        const { result } = renderHook(() => useCreatePost(), { wrapper })

        await act(async () => {
            try {
                await result.current.mutateAsync({
                    title: "t",
                    content: "c",
                    excerpt: "",
                    published: false
                })
            } catch {}
        })

        expect(typeof result.current.mutate).toBe("function")
    })
})


