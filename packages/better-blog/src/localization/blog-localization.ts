import { BLOG_CARD } from "./blog-card"
import { BLOG_COMMON } from "./blog-common"
import { BLOG_LIST } from "./blog-list"
import { BLOG_POST } from "./blog-post"

export const blogLocalization = {
    ...BLOG_COMMON,
    ...BLOG_LIST,
    ...BLOG_CARD,
    ...BLOG_POST
}

export type BlogLocalization = typeof blogLocalization
