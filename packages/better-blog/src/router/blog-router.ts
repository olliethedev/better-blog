// Blog router instance using yar
import { createRouter } from "@olliethedev/yar"
import {
    draftsRoute,
    editPostRoute,
    homeRoute,
    newPostRoute,
    postRoute,
    tagRoute
} from "./routes"

/**
 * All blog routes in a single object
 * Order matters: more specific routes should come before dynamic ones
 */
const routes = {
    home: homeRoute,
    new: newPostRoute,
    drafts: draftsRoute,
    tag: tagRoute,
    edit: editPostRoute,
    post: postRoute
} as const

/**
 * Create and export the blog router instance
 */
export const blogRouter = createRouter(routes)

/**
 * Export route type for type inference
 */
export type BlogRoutes = typeof routes
