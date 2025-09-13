import { QueryClient } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { createDemoMemoryDBProvider } from "../../providers/dummy-memory-db-provider"
import { createWrapper } from "../../test/utils"
import { usePostSearch } from "../index"

describe("usePostSearch", () => {
    test("handles search debouncing correctly", async () => {
        const provider = await createDemoMemoryDBProvider()
        // Create a fresh query client for each test to avoid cache interactions
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } }
        })
        const wrapper = createWrapper(provider, queryClient)

        // Start with an empty query
        const { result, rerender } = renderHook(
            (props) =>
                usePostSearch({
                    query: props.query,
                    enabled: true,
                    debounceMs: 10 // Use a very small debounce for testing
                }),
            {
                wrapper,
                initialProps: { query: "" }
            }
        )

        // With empty query, should not be searching
        expect(result.current.isSearching).toBe(false)
        expect(result.current.posts).toHaveLength(0)

        // Update to a real query
        rerender({ query: "hello" })

        // Should be in searching state
        expect(result.current.isSearching).toBe(true)

        // Wait for debounce to complete
        await waitFor(() => expect(result.current.isSearching).toBe(false))

        // Should have results after search completes
        expect(result.current.posts.length).toBeGreaterThan(0)

        // Change back to empty query
        rerender({ query: "" })

        // Should reset search
        await waitFor(() => expect(result.current.isSearching).toBe(false))
        expect(result.current.posts).toHaveLength(0)
    })

    test("preserves last successful results during loading", async () => {
        const provider = await createDemoMemoryDBProvider()
        // Create a fresh query client for each test to avoid cache interactions
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } }
        })
        const wrapper = createWrapper(provider, queryClient)

        // Start with a valid search query
        const { result, rerender } = renderHook(
            (props) =>
                usePostSearch({
                    query: props.query,
                    enabled: true,
                    debounceMs: 10
                }),
            {
                wrapper,
                initialProps: { query: "hello" }
            }
        )

        // Wait for initial search to complete
        await waitFor(() => expect(result.current.isSearching).toBe(false))
        const initialResults = result.current.posts
        expect(initialResults.length).toBeGreaterThan(0)

        // Change to a new query
        rerender({ query: "different query" })

        // During loading, should preserve the last results
        expect(result.current.isSearching).toBe(true)
        expect(result.current.posts).toEqual(initialResults)

        // Wait for new search to complete
        await waitFor(() => expect(result.current.isSearching).toBe(false))

        // Should have new results
        expect(result.current.posts).not.toEqual(initialResults)
    })
})
