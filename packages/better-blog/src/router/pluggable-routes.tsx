"use client"

/**
 * Client-side routes with React components
 *
 * NOTE: These routes mirror the server-safe routes in routes.ts but add client components.
 * The server routes (routes.ts) provide: meta, loader, seo (for SSR/SSG)
 * These client routes provide: PageComponent, LoadingComponent, ErrorComponent (for CSR)
 *
 * Both define the same paths and route types to work seamlessly in hybrid SSR/CSR scenarios.
 */

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
import type { RouteType } from "@/types"
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
 * Home route with components - mirrors server route but adds UI components
 * Path: /
 */
export const homeRoute = createRoute("/", () => ({
    PageComponent: HomePageComponent,
    LoadingComponent: PostsLoading,
    ErrorComponent: DefaultError,
    extra: () => ({ type: "home" as RouteType })
}))

/**
 * Post route with components - mirrors server route but adds UI components
 * Path: /:slug
 */
export const postRoute = createRoute("/:slug", () => ({
    PageComponent: PostPageComponent,
    LoadingComponent: PostLoading,
    ErrorComponent: DefaultError,
    extra: () => ({ type: "post" as RouteType })
}))

/**
 * Tag route with components - mirrors server route but adds UI components
 * Path: /tag/:tag
 */
export const tagRoute = createRoute("/tag/:tag", () => ({
    PageComponent: TagPageComponent,
    LoadingComponent: PostsLoading,
    ErrorComponent: DefaultError,
    extra: () => ({ type: "tag" as RouteType })
}))

/**
 * Drafts route with components - mirrors server route but adds UI components
 * Path: /drafts
 */
export const draftsRoute = createRoute("/drafts", () => ({
    PageComponent: DraftsPageComponent,
    LoadingComponent: PostsLoading,
    ErrorComponent: DefaultError,
    extra: () => ({ type: "drafts" as RouteType })
}))

/**
 * New post route with components - mirrors server route but adds UI components
 * Path: /new
 */
export const newPostRoute = createRoute("/new", () => ({
    PageComponent: NewPostPageComponent,
    LoadingComponent: FormLoading,
    ErrorComponent: DefaultError,
    extra: () => ({ type: "new" as RouteType })
}))

/**
 * Edit post route with components - mirrors server route but adds UI components
 * Path: /:slug/edit
 */
export const editPostRoute = createRoute("/:slug/edit", () => ({
    PageComponent: EditPostPageComponent,
    LoadingComponent: FormLoading,
    ErrorComponent: DefaultError,
    extra: () => ({ type: "edit" as RouteType })
}))
