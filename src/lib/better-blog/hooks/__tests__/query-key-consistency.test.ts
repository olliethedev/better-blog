import { QueryClient } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import { createWrapper } from "../../../../test/utils"
import { createDemoMemoryDBProvider } from "../../../better-blog/core/providers/dummy-memory-db-provider"
import { createBlogQueries } from "../../core/queries"
import { usePostSearch, usePosts } from "../index"

describe("Query key consistency", () => {
    test("usePosts and usePostSearch use compatible query keys", async () => {
        const provider = createDemoMemoryDBProvider()
        // Create a fresh query client to control the test environment
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } }
        })
        const wrapper = createWrapper(provider, queryClient)

        // First use the standard posts hook
        const { result: postsResult } = renderHook(
            () => usePosts({ limit: 10 }),
            {
                wrapper
            }
        )

        await waitFor(() => expect(postsResult.current.isLoading).toBe(false))
        expect(postsResult.current.posts).toHaveLength(10)

        // Then try pagination
        await act(async () => {
            await postsResult.current.loadMore()
        })
        await waitFor(() => expect(postsResult.current.posts).toHaveLength(12))

        // Now use the search hook with empty query 
        // Empty query should have no results as we disable the query
        const { result: searchResult } = renderHook(
            () => usePostSearch({ query: "", enabled: true, limit: 10 }),
            { wrapper }
        )

        // Empty search should not be loading
        expect(searchResult.current.isLoading).toBe(false)
        // Should have empty results as the query is disabled
        expect(searchResult.current.posts).toHaveLength(0)

        // Now use an actual search query
        const { result: activeSearchResult } = renderHook(
            () => usePostSearch({ query: "hello", enabled: true, limit: 10 }),
            { wrapper }
        )

        await waitFor(() =>
            expect(activeSearchResult.current.isLoading).toBe(false)
        )
        expect(activeSearchResult.current.posts.length).toBeGreaterThan(0)

        // Create a new query client for testing remount with fresh cache
        const remountQueryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } }
        })
        const remountWrapper = createWrapper(provider, remountQueryClient)
        
        // Test that page reload/remount scenario doesn't cause issues
        const { result: remountResult } = renderHook(
            () => usePosts({ limit: 10 }),
            {
                wrapper: remountWrapper
            }
        )

        await waitFor(() => expect(remountResult.current.isLoading).toBe(false))
        // Initial data load should have 10 items
        expect(remountResult.current.posts).toHaveLength(10)
    })

    test("query key generation is consistent", () => {
        const provider = createDemoMemoryDBProvider()
        const queries = createBlogQueries(provider)

        // Test all combinations of query key generation
        const baseQueryKey = queries.posts.list({}).queryKey
        const limitQueryKey = queries.posts.list({ limit: 10 }).queryKey
        const emptyQueryKey = queries.posts.list({ query: "" }).queryKey
        const queryKey = queries.posts.list({ query: "test" }).queryKey
        const tagKey = queries.posts.list({ tag: "test" }).queryKey
        const combinedKey = queries.posts.list({
            tag: "test",
            query: "search",
            limit: 5
        }).queryKey

        // Empty query should be same as no query
        expect(JSON.stringify(baseQueryKey)).toEqual(
            JSON.stringify(emptyQueryKey)
        )

        // Different limit should still have the same structure
        expect(baseQueryKey[0]).toEqual(limitQueryKey[0])
        expect(baseQueryKey[1]).toEqual(limitQueryKey[1])

        // Query with content should be different
        expect(JSON.stringify(baseQueryKey)).not.toEqual(
            JSON.stringify(queryKey)
        )

        // Tag should be different
        expect(JSON.stringify(baseQueryKey)).not.toEqual(JSON.stringify(tagKey))

        // Combined key should have all parameters
        const combinedParams = combinedKey[2] as Record<string, unknown>
        expect(combinedParams.tag).toEqual("test")
        expect(combinedParams.query).toEqual("search")
        expect(combinedParams.limit).toEqual(5)
    })
})
