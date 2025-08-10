import { BLOG_LIST } from "./blog-list";

export const blogLocalization = {
    ...BLOG_LIST,
}

export type BlogLocalization = Partial<typeof blogLocalization>