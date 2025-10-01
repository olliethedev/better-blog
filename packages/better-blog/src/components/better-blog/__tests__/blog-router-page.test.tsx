import { BlogProvider } from "@/context/better-blog-context"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { BlogPageRouter } from "../blog-router-page"

function renderWithProvider({
    path,
    basePath = "/posts"
}: {
    path?: string
    basePath?: string
}) {
    const dataProvider = {
        getAllPosts: async () => [],
        getPostBySlug: async () => null
    }

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false }
        }
    })

    return render(
        <QueryClientProvider client={queryClient}>
            <BlogProvider
                dataProvider={dataProvider}
                basePath={basePath}
                uploadImage={async () => "https://example.com/image.jpg"}
            >
                <BlogPageRouter path={path} />
            </BlogProvider>
        </QueryClientProvider>
    )
}

describe("BlogPageRouter", () => {
    test("renders Home for root path (uses basePath context)", async () => {
        renderWithProvider({ path: "/posts" })
        const header = await screen.findByTestId("page-header")
        expect(header).toBeInTheDocument()
    })

    test("renders Post for dynamic slug", async () => {
        renderWithProvider({ path: "/posts/hello-world" })
        // Will eventually show empty state since no post exists
        const emptyState = await screen.findByTestId("empty-state")
        expect(emptyState).toBeInTheDocument()
    })

    test("renders Tag for /tag/:tag", async () => {
        renderWithProvider({ path: "/posts/tag/react" })
        const header = await screen.findByTestId("page-header")
        expect(header).toBeInTheDocument()
    })

    test("renders Drafts for /drafts", async () => {
        renderWithProvider({ path: "/posts/drafts" })
        // Wait for Suspense to resolve
        const header = await screen.findByTestId("page-header")
        expect(header).toBeInTheDocument()
    })

    test("renders New for /new", async () => {
        renderWithProvider({ path: "/posts/new" })
        const header = await screen.findByTestId("page-header")
        expect(header).toBeInTheDocument()
    })

    test("renders Edit for /:slug/edit", async () => {
        renderWithProvider({ path: "/posts/my-post/edit" })
        // Will eventually show empty state since no post exists
        const emptyState = await screen.findByTestId("empty-state")
        expect(emptyState).toBeInTheDocument()
    })
})

describe("BlogPageRouter NotFound behavior", () => {
    test("renders default NotFound with unknown route message", async () => {
        renderWithProvider({ path: "/posts/does-not-exist/deep" })
        // Default NotFound renders error placeholder with localized strings
        const errorPlaceholder = await screen.findByTestId("error-placeholder")
        expect(errorPlaceholder).toBeInTheDocument()
        expect(
            screen.getByText(/Unknown route: \/does-not-exist\/deep/)
        ).toBeInTheDocument()
    })

    test('basePath normalization works for "posts" (no slashes)', async () => {
        renderWithProvider({ path: "/posts/new", basePath: "posts" })
        const header = await screen.findByTestId("page-header")
        expect(header).toBeInTheDocument()
    })

    test('basePath normalization works for "/posts/" (leading and trailing slash)', async () => {
        renderWithProvider({
            path: "/posts/new",
            basePath: "/posts/"
        })
        const header = await screen.findByTestId("page-header")
        expect(header).toBeInTheDocument()
    })
})
