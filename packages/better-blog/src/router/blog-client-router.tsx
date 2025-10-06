"use client"

/**
 * Shared client-side router instance with React components
 * Used by BlogPageRouter and BlogMetaTags
 */

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
 * Shared client-side blog router instance with components
 */
export const blogClientRouter = createRouter(clientRoutes)

/**
 * Export route type for type inference
 */
export type BlogClientRoutes = typeof clientRoutes
