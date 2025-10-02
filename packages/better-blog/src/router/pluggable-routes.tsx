"use client"

import { FormPageSkeleton } from "@/components/better-blog/form-page-skeleton"
import { ListPageSkeleton } from "@/components/better-blog/list-page-skeleton"
import {
    DraftsPageComponent,
    EditPostPageComponent,
    HomePageComponent,
    NewPostPageComponent,
    PostPageComponent,
    TagPageComponent
} from "@/components/better-blog/pages"
import { PostPageSkeleton } from "@/components/better-blog/post-page-skeleton"

import { DefaultError } from "@/components/better-blog/default-error"
// Pluggable route definitions with components for client-side use
import { createRoute } from "@olliethedev/yar"

// Default loading components
function FormLoading() {
    return (
        <div data-testid="form-skeleton">
            <FormPageSkeleton />
        </div>
    )
}

function PostsLoading() {
    return (
        <div data-testid="posts-skeleton">
            <ListPageSkeleton />
        </div>
    )
}

function PostLoading() {
    return (
        <div data-testid="post-skeleton">
            <PostPageSkeleton />
        </div>
    )
}

/**
 * Home route with components - displays list of all published posts
 * Path: /
 */
export const homeRoute = createRoute("/", () => ({
    PageComponent: HomePageComponent,
    LoadingComponent: PostsLoading,
    ErrorComponent: DefaultError,
    meta: () => [
        { name: "title", content: "Blog Posts" },
        { name: "description", content: "Latest blog posts" }
    ]
}))

/**
 * Post route with components - displays a single post by slug
 * Path: /:slug
 */
export const postRoute = createRoute("/:slug", ({ params }) => ({
    PageComponent: PostPageComponent,
    LoadingComponent: PostLoading,
    ErrorComponent: DefaultError,
    meta: () => [
        { name: "title", content: `Post: ${params.slug || ""}` },
        { name: "description", content: "Blog post content" }
    ]
}))

/**
 * Tag route with components - displays posts filtered by tag
 * Path: /tag/:tag
 */
export const tagRoute = createRoute("/tag/:tag", ({ params }) => ({
    PageComponent: TagPageComponent,
    LoadingComponent: PostsLoading,
    ErrorComponent: DefaultError,
    meta: () => [
        { name: "title", content: `Posts tagged: ${params.tag || ""}` },
        {
            name: "description",
            content: `All posts tagged with ${params.tag || ""}`
        }
    ]
}))

/**
 * Drafts route with components - displays all draft posts
 * Path: /drafts
 */
export const draftsRoute = createRoute("/drafts", () => ({
    PageComponent: DraftsPageComponent,
    LoadingComponent: PostsLoading,
    ErrorComponent: DefaultError,
    meta: () => [
        { name: "title", content: "My Drafts" },
        { name: "description", content: "Draft posts" }
    ]
}))

/**
 * New post route with components - form to create a new post
 * Path: /new
 */
export const newPostRoute = createRoute("/new", () => ({
    PageComponent: NewPostPageComponent,
    LoadingComponent: FormLoading,
    ErrorComponent: DefaultError,
    meta: () => [
        { name: "title", content: "Create New Post" },
        { name: "description", content: "Create a new blog post" }
    ]
}))

/**
 * Edit post route with components - form to edit an existing post
 * Path: /:slug/edit
 */
export const editPostRoute = createRoute("/:slug/edit", ({ params }) => ({
    PageComponent: EditPostPageComponent,
    LoadingComponent: FormLoading,
    ErrorComponent: DefaultError,
    meta: () => [
        { name: "title", content: `Editing: ${params.slug || ""}` },
        { name: "description", content: "Edit blog post" }
    ]
}))
