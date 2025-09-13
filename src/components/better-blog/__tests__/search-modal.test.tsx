import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type React from "react"
import { BlogProvider } from "../../../context/better-blog-context"
import type { BlogDataProvider, Post } from "../../../core/types"
import { SearchInput } from "../search-input"

const mockPosts: Post[] = [
    {
        id: "1",
        slug: "hello-world",
        title: "Hello World",
        content: "This is the hello world post content with some search terms",
        excerpt: "Hello world excerpt",
        published: true,
        publishedAt: new Date("2024-01-01"),
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: "1", name: "Test Author" }
    },
    {
        id: "2",
        slug: "react-tips",
        title: "React Tips and Tricks",
        content: "Learn about React hooks, components, and best practices",
        excerpt: "React tips excerpt",
        published: true,
        publishedAt: new Date("2024-01-02"),
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: "1", name: "Test Author" }
    },
    {
        id: "3",
        slug: "typescript-guide",
        title: "TypeScript Guide",
        content: "A comprehensive guide to TypeScript with examples",
        excerpt: "TypeScript guide excerpt",
        published: true,
        publishedAt: new Date("2024-01-03"),
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: "1", name: "Test Author" }
    }
]

const mockProvider: BlogDataProvider = {
    getAllPosts: jest.fn(async (filter) => {
        const query = filter?.query?.toLowerCase() || ""
        if (!query) return []

        return mockPosts.filter(
            (post) =>
                post.title.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query)
        )
    }),
    getPostBySlug: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn()
}

const createTestWrapper = (
    provider: BlogDataProvider = mockProvider,
    queryClient?: QueryClient,
    navigate?: (path: string) => void
) => {
    const client =
        queryClient ||
        new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    staleTime: 0,
                    gcTime: 0
                }
            }
        })

    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={client}>
            <BlogProvider
                dataProvider={provider}
                uploadImage={async () => ""}
                basePath="/blog"
                navigate={navigate || jest.fn()}
            >
                {children}
            </BlogProvider>
        </QueryClientProvider>
    )
    return TestWrapper
}

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}))

describe("SearchModal", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("opens modal on button click and closes on escape", async () => {
        const wrapper = createTestWrapper()
        render(<SearchInput />, { wrapper })

        // Find and click the search button
        const searchButton = screen.getByRole("button", { name: /search/i })
        expect(searchButton).toBeInTheDocument()

        fireEvent.click(searchButton)

        // Modal should be open
        await waitFor(() => {
            expect(
                screen.getByPlaceholderText("Type to search...")
            ).toBeInTheDocument()
        })

        // Press escape to close
        fireEvent.keyDown(document.body, { key: "Escape" })

        // Modal should be closed
        await waitFor(() => {
            expect(
                screen.queryByPlaceholderText("Type to search...")
            ).not.toBeInTheDocument()
        })
    })

    test("opens modal with keyboard shortcut", async () => {
        const wrapper = createTestWrapper()
        render(<SearchInput />, { wrapper })

        // Press Cmd+K to open
        fireEvent.keyDown(document.body, { key: "k", metaKey: true })

        // Modal should be open
        await waitFor(() => {
            expect(
                screen.getByPlaceholderText("Type to search...")
            ).toBeInTheDocument()
        })
    })

    test("searches and displays results", async () => {
        const user = userEvent.setup()
        const wrapper = createTestWrapper()
        render(<SearchInput />, { wrapper })

        // Open modal
        const searchButton = screen.getByRole("button", { name: /search/i })
        fireEvent.click(searchButton)

        // Get search input
        const searchInput =
            await screen.findByPlaceholderText("Type to search...")

        // Type search query
        await user.type(searchInput, "react")

        // Wait for debounce and results
        await waitFor(
            () => {
                // Check that the result appears - it will have highlighted text
                const resultButtons = screen.getAllByRole("button")
                const reactResult = resultButtons.find(btn => 
                    btn.textContent?.includes("React") && 
                    btn.textContent?.includes("Tips and Tricks")
                )
                expect(reactResult).toBeInTheDocument()
            },
            { timeout: 2000 }
        )

        // Should not show posts that don't match
        expect(screen.queryByText("Hello World")).not.toBeInTheDocument()
        expect(screen.queryByText("TypeScript Guide")).not.toBeInTheDocument()
    })

    test("shows empty state when no results found", async () => {
        const user = userEvent.setup()
        const wrapper = createTestWrapper()
        render(<SearchInput />, { wrapper })

        // Open modal
        const searchButton = screen.getByRole("button", { name: /search/i })
        fireEvent.click(searchButton)

        // Get search input
        const searchInput =
            await screen.findByPlaceholderText("Type to search...")

        // Type search query that won't match anything
        await user.type(searchInput, "nonexistent")

        // Wait for debounce and empty state
        await waitFor(
            () => {
                expect(
                    screen.getByText("No results found.")
                ).toBeInTheDocument()
            },
            { timeout: 2000 }
        )
    })

    test("navigates to post on click", async () => {
        const user = userEvent.setup()
        const mockNavigate = jest.fn()
        const wrapper = createTestWrapper(mockProvider, undefined, mockNavigate)

        render(<SearchInput />, { wrapper })

        // Open modal
        const searchButton = screen.getByRole("button", { name: /search/i })
        fireEvent.click(searchButton)

        // Search for react
        const searchInput =
            await screen.findByPlaceholderText("Type to search...")
        await user.type(searchInput, "react")

        // Wait for results
        await waitFor(
            () => {
                const resultButtons = screen.getAllByRole("button")
                const reactResult = resultButtons.find(btn => 
                    btn.textContent?.includes("React") && 
                    btn.textContent?.includes("Tips and Tricks")
                )
                expect(reactResult).toBeInTheDocument()
            },
            { timeout: 2000 }
        )

        // Click on result
        const resultButtons = screen.getAllByRole("button")
        const reactResult = resultButtons.find(btn => 
            btn.textContent?.includes("React") && 
            btn.textContent?.includes("Tips and Tricks")
        )
        fireEvent.click(reactResult!)

        // Should navigate to the post
        expect(mockNavigate).toHaveBeenCalledWith("/blog/react-tips")
    })

    test("clears search on modal close", async () => {
        const user = userEvent.setup()
        const wrapper = createTestWrapper()
        render(<SearchInput />, { wrapper })

        // Open modal
        const searchButton = screen.getByRole("button", { name: /search/i })
        fireEvent.click(searchButton)

        // Type search
        const searchInput =
            await screen.findByPlaceholderText("Type to search...")
        await user.type(searchInput, "react")

        // Wait for results
        await waitFor(
            () => {
                const resultButtons = screen.getAllByRole("button")
                const reactResult = resultButtons.find(btn => 
                    btn.textContent?.includes("React") && 
                    btn.textContent?.includes("Tips and Tricks")
                )
                expect(reactResult).toBeInTheDocument()
            },
            { timeout: 2000 }
        )

        // Close modal
        fireEvent.keyDown(document.body, { key: "Escape" })

        await waitFor(() => {
            expect(
                screen.queryByPlaceholderText("Type to search...")
            ).not.toBeInTheDocument()
        })

        // Reopen modal
        fireEvent.click(searchButton)

        // Search input should be empty
        const newSearchInput =
            await screen.findByPlaceholderText("Type to search...")
        expect(newSearchInput).toHaveValue("")

        // Should not show previous results
        // Look for result content that shouldn't be there
        expect(screen.queryByText(/Learn about.*React.*hooks/i)).not.toBeInTheDocument()
    })

    test("highlights search terms in results", async () => {
        const user = userEvent.setup()
        const wrapper = createTestWrapper()
        render(<SearchInput />, { wrapper })

        // Open modal
        const searchButton = screen.getByRole("button", { name: /search/i })
        fireEvent.click(searchButton)

        // Search for "tips"
        const searchInput =
            await screen.findByPlaceholderText("Type to search...")
        await user.type(searchInput, "tips")

        // Wait for results
        await waitFor(
            () => {
                // Should find the highlighted text
                const highlighted = screen.getByText("Tips", { exact: false })
                expect(highlighted).toBeInTheDocument()
                // The highlight component should have the correct class
                const markElement = highlighted.closest("mark.bg-yellow-200")
                expect(markElement).toBeInTheDocument()
            },
            { timeout: 2000 }
        )
    })

    test("debounces search queries", async () => {
        const user = userEvent.setup()
        const wrapper = createTestWrapper()
        render(<SearchInput />, { wrapper })

        // Reset mock to count calls
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        mockProvider.getAllPosts = jest.fn(mockProvider.getAllPosts as any)

        // Open modal
        const searchButton = screen.getByRole("button", { name: /search/i })
        fireEvent.click(searchButton)

        // Type quickly
        const searchInput =
            await screen.findByPlaceholderText("Type to search...")
        await user.type(searchInput, "react")

        // Wait for debounce
        await waitFor(
            () => {
                const resultButtons = screen.getAllByRole("button")
                const reactResult = resultButtons.find(btn => 
                    btn.textContent?.includes("React") && 
                    btn.textContent?.includes("Tips and Tricks")
                )
                expect(reactResult).toBeInTheDocument()
            },
            { timeout: 2000 }
        )

        // Should only have made one API call after debounce
        expect(mockProvider.getAllPosts).toHaveBeenCalledTimes(1)
        expect(mockProvider.getAllPosts).toHaveBeenCalledWith(
            expect.objectContaining({
                query: "react"
            })
        )
    })
})