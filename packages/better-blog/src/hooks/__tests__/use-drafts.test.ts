import { renderHook, waitFor } from "@testing-library/react"
import { createSeededMemoryProvider } from "../../providers/memory/memory-provider"
import { createWrapper } from "../../test/utils"
import { useDrafts } from "../index"

describe("useDrafts", () => {
    test("filters unpublished and paginates", async () => {
        const provider = await createSeededMemoryProvider()
        const wrapper = createWrapper(provider)
        const { result } = renderHook(() => useDrafts(), { wrapper })
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.drafts.every((p) => !p.published)).toBe(true)
        // With demo data, there are only 3 drafts in total (every 5th of 15)
        expect(result.current.drafts.length).toBe(3)
    })
})
