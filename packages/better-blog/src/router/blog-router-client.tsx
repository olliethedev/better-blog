"use client"

// Client-side blog router with components
import { createRouter } from "@olliethedev/yar"
import {
    draftsRoute,
    editPostRoute,
    homeRoute,
    newPostRoute,
    postRoute,
    tagRoute
} from "./pluggable-routes"

/**
 * All blog routes with components in a single object
 * Order matters: more specific routes should come before dynamic ones
 */
const clientRoutes = {
    home: homeRoute,
    new: newPostRoute,
    drafts: draftsRoute,
    tag: tagRoute,
    edit: editPostRoute,
    post: postRoute
} as const

/**
 * Create and export the client-side blog router instance with components
 */
export const blogRouterClient = createRouter(clientRoutes)

/**
 * Export route type for type inference
 */
export type BlogRoutesClient = typeof clientRoutes

