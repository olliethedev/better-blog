import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import type React from "react"
import { BlogProvider } from "../../../lib/better-blog/context/better-blog-context"
import type {
    BlogDataProvider,
    Post
} from "../../../lib/better-blog/core/types"
import { usePostSearch } from "../../../lib/better-blog/hooks"
import { HomePageComponent } from "../pages/home-page"

// Mock posts for testing
const createMockPosts = (count: number): Post[] =>
    Array.from({ length: count }, (_, i) => ({
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

describe("Search and Query Integration", () => {
    let queryClient: QueryClient
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let apiCalls: Array<{ type: string; params: any }> = []

    const mockProvider: BlogDataProvider = {
        getAllPosts: jest.fn(async (filter) => {
            apiCalls.push({ type: "getAllPosts", params: filter })
            const allPosts = createMockPosts(30)

            // Handle search filtering
            if (filter?.query) {
                const query = filter.query.toLowerCase()
                const filtered = allPosts.filter(
                    (post) =>
                        post.title.toLowerCase().includes(query) ||
                        post.content.toLowerCase().includes(query)
                )
                return filtered.slice(
                    filter.offset || 0,
                    (filter.offset || 0) + (filter.limit || 10)
                )
            }

            // Handle regular pagination
            const offset = filter?.offset ?? 0
            const limit = filter?.limit ?? 10
            return allPosts.slice(offset, offset + limit)
        }),
        getPostBySlug: jest.fn(),
        createPost: jest.fn(),
        updatePost: jest.fn(),
        deletePost: jest.fn()
    }

    beforeEach(() => {
        apiCalls = []
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

    test("home page pagination doesn't create duplicate query keys", async () => {
        const TestWrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                <BlogProvider
                    dataProvider={mockProvider}
                    uploadImage={async () => ""}
                    basePath="/blog"
                >
                    {children}
                </BlogProvider>
            </QueryClientProvider>
        )

        render(<HomePageComponent />, { wrapper: TestWrapper })

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByText("Post 1")).toBeInTheDocument()
        })

        // Check initial API call
        expect(apiCalls).toHaveLength(1)
        expect(apiCalls[0]).toEqual({
            type: "getAllPosts",
            params: {
                tag: undefined,
                query: undefined,
                limit: 10,
                offset: 0,
                published: true
            }
        })

        // Check query cache
        const queries = queryClient.getQueryCache().getAll()
        const postQueries = queries.filter(
            (q) =>
                Array.isArray(q.queryKey) &&
                q.queryKey[0] === "posts" &&
                q.queryKey[1] === "list"
        )

        // Should only have one query
        expect(postQueries).toHaveLength(1)

        // Verify the exact query key structure
        expect(postQueries[0].queryKey).toEqual([
            "posts",
            "list",
            {
                tag: undefined,
                query: undefined,
                limit: 10,
                published: true
            }
        ])

        // Click load more
        const loadMoreButton = screen.getByText("Load more posts")
        loadMoreButton.click()

        // Wait for second page
        await waitFor(() => {
            expect(screen.getByText("Post 11")).toBeInTheDocument()
        })

        // Should have made second API call
        expect(apiCalls).toHaveLength(2)
        expect(apiCalls[1]).toEqual({
            type: "getAllPosts",
            params: {
                tag: undefined,
                query: undefined,
                limit: 10,
                offset: 10,
                published: true
            }
        })

        // Query cache should still have only one query (infinite query)
        const updatedQueries = queryClient.getQueryCache().getAll()
        const updatedPostQueries = updatedQueries.filter(
            (q) =>
                Array.isArray(q.queryKey) &&
                q.queryKey[0] === "posts" &&
                q.queryKey[1] === "list"
        )

        expect(updatedPostQueries).toHaveLength(1)
    })

    test("search uses correct query keys separate from regular posts", async () => {
        const TestWrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                <BlogProvider
                    dataProvider={mockProvider}
                    uploadImage={async () => ""}
                    basePath="/blog"
                >
                    {children}
                </BlogProvider>
            </QueryClientProvider>
        )

        // First, render a component that uses the search hook
        const SearchTestComponent = () => {
            const { posts } = usePostSearch({ query: "post 5", enabled: true })

            return (
                <div>
                    {posts.map((post: Post) => (
                        <div key={post.id}>{post.title}</div>
                    ))}
                </div>
            )
        }

        render(
            <TestWrapper>
                <HomePageComponent />
                <SearchTestComponent />
            </TestWrapper>
        )

        // Wait for both queries to complete
        await waitFor(() => {
            expect(screen.getByText("Post 1")).toBeInTheDocument() // From home page
            expect(screen.getByText("Post 5")).toBeInTheDocument() // From search
        })

        // Check API calls
        const searchCalls = apiCalls.filter((call) => call.params?.query)
        const regularCalls = apiCalls.filter((call) => !call.params?.query)

        expect(regularCalls).toHaveLength(1)
        expect(searchCalls).toHaveLength(1)

        // Verify search call has the query
        expect(searchCalls[0].params).toEqual({
            tag: undefined,
            query: "post 5",
            limit: 10,
            offset: 0,
            published: true
        })

        // Check query cache has two separate queries
        const queries = queryClient.getQueryCache().getAll()
        const postQueries = queries.filter(
            (q) =>
                Array.isArray(q.queryKey) &&
                q.queryKey[0] === "posts" &&
                q.queryKey[1] === "list"
        )

        expect(postQueries).toHaveLength(2)

        // Find and verify each query key
        const regularQuery = postQueries.find((q) => {
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            const params = q.queryKey[2] as any
            return !params.query
        })
        const searchQuery = postQueries.find((q) => {
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            const params = q.queryKey[2] as any
            return params.query === "post 5"
        })

        expect(regularQuery).toBeDefined()
        expect(searchQuery).toBeDefined()

        expect(regularQuery?.queryKey).toEqual([
            "posts",
            "list",
            {
                tag: undefined,
                query: undefined,
                limit: 10,
                published: true
            }
        ])

        expect(searchQuery?.queryKey).toEqual([
            "posts",
            "list",
            {
                tag: undefined,
                query: "post 5",
                limit: 10,
                published: true
            }
        ])
    })
})
