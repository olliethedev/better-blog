// Server-safe route definitions (no component imports)
// This file can be imported in both server and client contexts
import { createRoute } from "@olliethedev/yar"

/**
 * Home route - displays list of all published posts
 * Path: /
 */
export const homeRoute = createRoute(
    "/",
    () => ({
        meta: () => [
            { name: "title", content: "Blog Posts" },
            { name: "description", content: "Latest blog posts" }
        ]
    })
)

/**
 * Post route - displays a single post by slug
 * Path: /:slug
 */
export const postRoute = createRoute(
    "/:slug",
    ({ params }) => ({
        meta: () => [
            { name: "title", content: `Post: ${params.slug || ""}` },
            { name: "description", content: "Blog post content" }
        ]
    })
)

/**
 * Tag route - displays posts filtered by tag
 * Path: /tag/:tag
 */
export const tagRoute = createRoute(
    "/tag/:tag",
    ({ params }) => ({
        meta: () => [
            { name: "title", content: `Posts tagged: ${params.tag || ""}` },
            {
                name: "description",
                content: `All posts tagged with ${params.tag || ""}`
            }
        ]
    })
)

/**
 * Drafts route - displays all draft posts
 * Path: /drafts
 */
export const draftsRoute = createRoute(
    "/drafts",
    () => ({
        meta: () => [
            { name: "title", content: "My Drafts" },
            { name: "description", content: "Draft posts" }
        ]
    })
)

/**
 * New post route - form to create a new post
 * Path: /new
 */
export const newPostRoute = createRoute(
    "/new",
    () => ({
        meta: () => [
            { name: "title", content: "Create New Post" },
            { name: "description", content: "Create a new blog post" }
        ]
    })
)

/**
 * Edit post route - form to edit an existing post
 * Path: /:slug/edit
 */
export const editPostRoute = createRoute(
    "/:slug/edit",
    ({ params }) => ({
        meta: () => [
            { name: "title", content: `Editing: ${params.slug || ""}` },
            { name: "description", content: "Edit blog post" }
        ]
    })
)

