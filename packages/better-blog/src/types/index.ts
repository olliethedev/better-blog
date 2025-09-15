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
}export interface BlogDataProviderConfig {
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

    NotFoundComponent?: React.ComponentType<{ message: string} >
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

