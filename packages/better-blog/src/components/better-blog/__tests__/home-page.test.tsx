import type { Post } from "@/types"
import type { BlogDataProvider } from "@/types"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { BlogProvider } from "../../../context/better-blog-context"
import { PostsLoading } from "../loading"
import { HomePageComponent } from "../pages/home-page"

// Mock API handler to track calls
let apiCallCount = 0
let lastApiCall: { offset: number; limit: number } | null = null

const mockPosts: Post[] = Array.from({ length: 25 }, (_, i) => ({
    id: `${i + 1}`,
    slug: `post-${i + 1}`,
    title: `Post ${i + 1}`,
    content: `Content for post ${i + 1}`,
    excerpt: `Excerpt for post ${i + 1}`,
    published: true,
    publishedAt: new Date(
        `2024-01-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`
    ),
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    author: { id: "1", name: "Test Author" }
}))

const mockProvider: BlogDataProvider = {
    getAllPosts: jest.fn(async (filter) => {
        const offset = filter?.offset ?? 0
        const limit = filter?.limit ?? 10
        apiCallCount++
        lastApiCall = { offset, limit }
        await new Promise((resolve) => setTimeout(resolve, 10)) // Small delay to simulate network
        return mockPosts.slice(offset, offset + limit)
    }),
    getPostBySlug: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn()
}

const createTestWrapper = (
    provider: BlogDataProvider,
    queryClient: QueryClient,
    navigate?: (path: string) => void
) => {
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <BlogProvider
                dataProvider={provider}
                uploadImage={async () => ""}
                basePath="/blog"
                navigate={navigate}
            >
                <React.Suspense fallback={<PostsLoading />}>
                    {children}
                </React.Suspense>
            </BlogProvider>
        </QueryClientProvider>
    )
    return TestWrapper
}

describe("HomePage", () => {
    let queryClient: QueryClient

    beforeEach(() => {
        apiCallCount = 0
        lastApiCall = null
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    staleTime: 0,
                    gcTime: 0
                }
            }
        })
        jest.clearAllMocks()
    })

    test("loads initial posts and handles pagination correctly", async () => {
        const wrapper = createTestWrapper(mockProvider, queryClient)

        render(<HomePageComponent />, { wrapper })

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByText("Post 1")).toBeInTheDocument()
        })

        // Verify initial posts loaded (first 10)
        for (let i = 1; i <= 10; i++) {
            expect(screen.getByText(`Post ${i}`)).toBeInTheDocument()
        }
        expect(screen.queryByText("Post 11")).not.toBeInTheDocument()

        // Check that only one API call was made
        expect(apiCallCount).toBe(1)
        expect(lastApiCall).toEqual({ offset: 0, limit: 10 })

        // Find and click load more button
        const loadMoreButton = screen.getByText("Load more posts")
        expect(loadMoreButton).toBeInTheDocument()

        // Click load more
        fireEvent.click(loadMoreButton)

        // Wait for next page to load
        await waitFor(() => {
            expect(screen.getByText("Post 11")).toBeInTheDocument()
        })

        // Verify second page loaded (posts 11-20)
        for (let i = 1; i <= 20; i++) {
            expect(screen.getByText(`Post ${i}`)).toBeInTheDocument()
        }
        expect(screen.queryByText("Post 21")).not.toBeInTheDocument()

        // Check that second API call was made with correct offset
        expect(apiCallCount).toBe(2)
        expect(lastApiCall).toEqual({ offset: 10, limit: 10 })

        // Click load more again
        fireEvent.click(loadMoreButton)

        // Wait for third page
        await waitFor(() => {
            expect(screen.getByText("Post 21")).toBeInTheDocument()
        })

        // Verify all 25 posts are shown
        for (let i = 1; i <= 25; i++) {
            expect(screen.getByText(`Post ${i}`)).toBeInTheDocument()
        }

        // Check API calls
        expect(apiCallCount).toBe(3)
        expect(lastApiCall).toEqual({ offset: 20, limit: 10 })

        // Load more button should be disabled/hidden since we've loaded all posts
        await waitFor(() => {
            expect(
                screen.queryByText("Load more posts")
            ).not.toBeInTheDocument()
        })
    })

    test("query keys are consistent and don't cause duplicate calls", async () => {
        const wrapper = createTestWrapper(mockProvider, queryClient)

        render(<HomePageComponent />, { wrapper })

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByText("Post 1")).toBeInTheDocument()
        })

        // Get initial call count
        const initialCallCount = apiCallCount

        // Check query cache for duplicate keys
        const queryCache = queryClient.getQueryCache()
        const queries = queryCache.getAll()

        // Should only have one query for posts list
        const postQueries = queries.filter(
            (q) =>
                Array.isArray(q.queryKey) &&
                q.queryKey[0] === "posts" &&
                q.queryKey[1] === "list"
        )

        expect(postQueries).toHaveLength(1)

        // Verify the query key structure
        const queryKey = postQueries[0].queryKey
        expect(queryKey).toEqual([
            "posts",
            "list",
            {
                tag: undefined,
                query: undefined,
                limit: 10,
                published: true
            }
        ])

        // Re-render to ensure no duplicate calls
        const { rerender } = render(<HomePageComponent />, { wrapper })
        rerender(<HomePageComponent />)

        // Wait a bit to ensure no duplicate calls
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Should still have same number of API calls
        expect(apiCallCount).toBe(initialCallCount)
    })

    test("handles loading states correctly", async () => {
        // Slow down API calls to test loading state
        const slowProvider: BlogDataProvider = {
            ...mockProvider,
            getAllPosts: jest.fn(async (filter) => {
                await new Promise((resolve) => setTimeout(resolve, 100))
                return mockProvider.getAllPosts(filter)
            })
        }

        const wrapper = createTestWrapper(slowProvider, queryClient)

        render(<HomePageComponent />, { wrapper })

        // Should show loading state initially
        expect(screen.getByTestId("posts-skeleton")).toBeInTheDocument()

        // Wait for posts to load
        await waitFor(() => {
            expect(
                screen.queryByTestId("posts-skeleton")
            ).not.toBeInTheDocument()
            expect(screen.getByText("Post 1")).toBeInTheDocument()
        })

        // Click load more
        const loadMoreButton = screen.getByText("Load more posts")
        fireEvent.click(loadMoreButton)

        // The button should change to loading state
        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: /loading/i })
            ).toBeInTheDocument()
        })

        // Wait for next page
        await waitFor(() => {
            expect(
                screen.queryByRole("button", { name: /loading/i })
            ).not.toBeInTheDocument()
            expect(screen.getByText("Post 11")).toBeInTheDocument()
        })
    })

    test("handles empty state correctly", async () => {
        const emptyProvider: BlogDataProvider = {
            ...mockProvider,
            getAllPosts: jest.fn(async () => [])
        }

        const wrapper = createTestWrapper(emptyProvider, queryClient)

        render(<HomePageComponent />, { wrapper })

        await waitFor(() => {
            expect(
                screen.getByText("There are no posts here yet.")
            ).toBeInTheDocument()
        })

        // Should not show load more button
        expect(screen.queryByText("Load more posts")).not.toBeInTheDocument()
    })
})
