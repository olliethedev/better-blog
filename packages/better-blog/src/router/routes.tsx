// Server-safe route definitions (no React component imports)
import type { RouteSchema } from "./types"
import type { RouteDefinition } from "./types"

const routes: RouteDefinition[] = [
    {
        type: "home",
        pattern: [],
        staticRoutes: [{ slug: [] }],
        metadata: {
            title: "Blog Posts",
            description: "Latest blog posts"
        }
    },

    {
        type: "post",
        pattern: [":slug"],
        metadata: {
            title: (params) => `Post: ${params.slug}`,
            description: "Blog post content"
        }
    },

    {
        type: "tag",
        pattern: ["tag", ":tag"],
        metadata: {
            title: (params) => `Posts tagged: ${params.tag}`,
            description: (params) => `All posts tagged with ${params.tag}`
        }
    },

    {
        type: "drafts",
        pattern: ["drafts"],
        staticRoutes: [{ slug: ["drafts"] }],
        metadata: {
            title: "My Drafts",
            description: "Draft posts"
        }
    },

    {
        type: "new",
        pattern: ["new"],
        staticRoutes: [{ slug: ["new"] }],
        metadata: {
            title: "Create New Post",
            description: "Create a new blog post"
        }

        // No data handler needed for new post page
    },

    {
        type: "edit",
        pattern: [":slug", "edit"],
        metadata: {
            title: (params) => `Editing: ${params.slug}`,
            description: "Edit blog post"
        }
    }
]

export const routeSchema: RouteSchema = {
    routes
}
