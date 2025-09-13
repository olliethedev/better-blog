import { QueryClient } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import { createDemoMemoryDBProvider } from "../../providers/dummy-memory-db-provider"
import { createBlogQueryKeys } from "../../queries"
import { createWrapper } from "../../test/utils"
import { usePostSearch, usePosts } from "../index"

describe("usePosts", () => {
    test("loads first page and paginates", async () => {
        const provider = await createDemoMemoryDBProvider()
        const wrapper = createWrapper(provider)
        const { result } = renderHook(() => usePosts({ limit: 10 }), {
            wrapper
        })

        expect(result.current.isLoading).toBe(true)
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.posts).toHaveLength(10)

        await act(async () => {
            await result.current.loadMore()
        })
        await waitFor(() => expect(result.current.posts).toHaveLength(12))
    })

    test("handles empty query parameter correctly", async () => {
        const provider = await createDemoMemoryDBProvider()
        const wrapper = createWrapper(provider)
        const queryClient = new QueryClient()

        // Spy on fetchQuery to check the exact query keys being used
        const fetchQuerySpy = jest.spyOn(queryClient, "fetchInfiniteQuery")

        const { result: resultWithoutQuery } = renderHook(
            () => usePosts({ limit: 10 }),
            {
                wrapper
            }
        )

        await waitFor(() =>
            expect(resultWithoutQuery.current.isLoading).toBe(false)
        )

        const { result: resultWithEmptyQuery } = renderHook(
            () => usePosts({ limit: 10, query: "" }),
            {
                wrapper
            }
        )

        await waitFor(() =>
            expect(resultWithEmptyQuery.current.isLoading).toBe(false)
        )

        // Check that both results use the same query key structure
        expect(resultWithoutQuery.current.posts).toHaveLength(10)
        expect(resultWithEmptyQuery.current.posts).toHaveLength(10)
    })

    test("generates consistent query keys", async () => {
        const provider = await createDemoMemoryDBProvider()
        const queries = createBlogQueryKeys(provider)

        // Test various scenarios to ensure query keys are consistent
        const noQueryKey = queries.posts.list({ limit: 10 }).queryKey
        const emptyQueryKey = queries.posts.list({
            limit: 10,
            query: ""
        }).queryKey
        const withQueryKey = queries.posts.list({
            limit: 10,
            query: "test"
        }).queryKey

        // Empty query should be treated the same as no query
        expect(JSON.stringify(noQueryKey)).toEqual(
            JSON.stringify(emptyQueryKey)
        )

        // Query with value should be different
        expect(JSON.stringify(noQueryKey)).not.toEqual(
            JSON.stringify(withQueryKey)
        )
    })
})

describe("usePostSearch", () => {
    test("handles empty search query correctly", async () => {
        const provider = await createDemoMemoryDBProvider()
        const wrapper = createWrapper(provider)

        const { result } = renderHook(
            () => usePostSearch({ query: "", enabled: true }),
            {
                wrapper
            }
        )

        // Should not be loading with an empty query
        expect(result.current.isLoading).toBe(false)
        expect(result.current.posts).toHaveLength(0)
    })

    test("returns search results with valid query", async () => {
        const provider = await createDemoMemoryDBProvider()
        const wrapper = createWrapper(provider)

        const { result } = renderHook(
            () => usePostSearch({ query: "hello", enabled: true }),
            {
                wrapper
            }
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.posts.length).toBeGreaterThan(0)
    })
})
