// Cross-cutting types
import type {
    PostCreateExtendedInput,
    PostUpdateExtendedInput
} from "@/schema/post"
import type React from "react"

export type Post = {
    id: string
    authorId?: string
    defaultLocale?: string
    slug: string
    title: string
    content: string
    excerpt: string
    image?: string
    published: boolean
    status?: "DRAFT" | "PUBLISHED"
    publishedAt?: Date
    tags: Tag[]
    createdAt: Date
    updatedAt: Date
    author: Author | null
}
export interface BlogDataProvider {
    getAllPosts: (filter?: {
        slug?: string
        tag?: string
        offset?: number
        limit?: number
        query?: string
        published?: boolean
        locale?: string
    }) => Promise<Post[]>
    getPostBySlug?: (
        slug: string,
        options?: { locale?: string }
    ) => Promise<Post | null>
    createPost?: (input: PostCreateExtendedInput) => Promise<Post>
    updatePost?: (slug: string, input: PostUpdateExtendedInput) => Promise<Post>
    deletePost?: (slug: string) => Promise<void>
}
export interface BlogDataProviderConfig {
    getAuthor?: (id: string) => Promise<Author | null>
    defaultLocale?: string
}
export interface RouteMatch {
    type: "home" | "post" | "tag" | "drafts" | "new" | "edit" | "unknown"
    params?: {
        slug?: string
        tag?: string
        postSlug?: string
    }
    metadata: {
        title: string
        description?: string
        image?: string
    }
}
/**
 * @deprecated PageComponentOverrides is deprecated in favor of creating custom routes with yar.
 * Instead of using pageOverrides, create custom routes using createRoute from @olliethedev/yar
 * and combine them with Better Blog's routes.
 *
 * This interface is kept for backward compatibility but will be removed in a future version.
 */
export interface PageComponentOverrides {
    HomeComponent?: React.ComponentType
    PostComponent?: React.ComponentType
    TagComponent?: React.ComponentType
    DraftsComponent?: React.ComponentType
    NewPostComponent?: React.ComponentType
    EditPostComponent?: React.ComponentType

    HomeLoadingComponent?: React.ComponentType
    PostLoadingComponent?: React.ComponentType
    TagLoadingComponent?: React.ComponentType
    DraftsLoadingComponent?: React.ComponentType
    NewPostLoadingComponent?: React.ComponentType
    EditPostLoadingComponent?: React.ComponentType

    HomeErrorComponent?: React.ComponentType<{ message?: string }>
    PostErrorComponent?: React.ComponentType<{ message?: string }>
    TagErrorComponent?: React.ComponentType<{ message?: string }>
    DraftsErrorComponent?: React.ComponentType<{ message?: string }>
    NewPostErrorComponent?: React.ComponentType<{ message?: string }>
    EditPostErrorComponent?: React.ComponentType<{ message?: string }>

    NotFoundComponent?: React.ComponentType<{ message: string }>
}
export type Author = {
    id: string
    name: string
    image?: string
}
export type Tag = {
    id: string
    slug: string
    name: string
}

export interface BlogPageMetadata {
    title: string
    description?: string
    openGraph?: {
        title?: string
        description?: string
        url?: string
        type?: string
        siteName?: string
        images?: Array<{ url: string } | string>
    }
    twitter?: {
        card?: "summary" | "summary_large_image"
        title?: string
        description?: string
        images?: Array<string>
    }
    /** Canonical URL of the page */
    canonicalUrl?: string
    /** Robots directive, e.g., "index,follow" or "noindex,nofollow" */
    robots?: string
}

export interface BlogPostMetadata {
    title: string
    description?: string
    image?: string
}

/**
 * Site-wide SEO configuration used to enrich per-page metadata
 * and generate structured data.
 */
export interface SeoSiteConfig {
    /** Absolute origin like https://example.com (no trailing slash) */
    siteUrl?: string
    /** Site/Blog name for OpenGraph and JSON-LD publisher */
    siteName?: string
    /** Organization/Publisher name */
    publisherName?: string
    /** Absolute URL to publisher logo */
    publisherLogoUrl?: string
    /** Default locale like en_US */
    defaultLocale?: string
    /** Twitter handle for site, e.g., @acme */
    twitterSite?: string
    /** Default twitter creator handle if not derivable from post author */
    twitterCreator?: string
    /** Default image used when a page/post has none */
    defaultImageUrl?: string
}

/**
 * The full SEO payload returned by the resolver.
 */
export interface BlogPageSEO {
    /** Clean, framework-agnostic metadata */
    meta: BlogPageMetadata
    /** Structured data objects to be serialized as JSON-LD */
    structuredData: Array<Record<string, unknown>>
}
