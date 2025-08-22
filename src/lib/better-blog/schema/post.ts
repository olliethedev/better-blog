import { z } from "zod"

// Base create schema for Post forms
// Includes meta fields so the form can safely omit them
export const PostCreateSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    excerpt: z.string().optional().default(""),
    slug: z.string().min(1).optional(),
    image: z.string().optional(),
    published: z.boolean().optional().default(false),
    publishedAt: z.coerce.date().optional(),
    authorId: z.string().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional()
})

// Base update schema for Post forms
// Keep most fields present; meta fields included to allow omission upstream
export const PostUpdateSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    excerpt: z.string().optional().default(""),
    slug: z.string().min(1, "Slug is required"),
    image: z.string().optional(),
    published: z.boolean().optional(),
    publishedAt: z.coerce.date().optional(),
    authorId: z.string().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional()
})

export type PostCreateInput = z.infer<typeof PostCreateSchema>
export type PostUpdateInput = z.infer<typeof PostUpdateSchema>

// Shared query schema for listing posts via API
export const PostListQuerySchema = z.object({
    slug: z.string().optional(),
    tag: z.string().optional(),
    offset: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    query: z.string().optional(),
    published: z.coerce.boolean().optional()
})

export type PostListQueryInput = z.infer<typeof PostListQuerySchema>

// Shared leaf schemas
export const TagSchema = z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string()
})
export const AuthorSchema = z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().optional()
})

// Runtime Post schema (dates as Date objects)
export const PostSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    content: z.string(),
    excerpt: z.string(),
    image: z.string().optional(),
    published: z.boolean(),
    publishedAt: z.date().optional(),
    tags: z.array(TagSchema).default([]),
    createdAt: z.date(),
    updatedAt: z.date(),
    author: AuthorSchema
})

// Serialized Post schema as returned by the API (dates as strings or Date)
export const PostSerializedSchema = PostSchema.omit({
    createdAt: true,
    updatedAt: true,
    publishedAt: true
}).extend({
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional(),
    publishedAt: z.union([z.string(), z.date()]).nullable().optional()
})

export const PostSerializedArraySchema = z.array(PostSerializedSchema)

// ==========================================================================
// Extended TypeScript-only input types for providers (support nested tag ops)
// ==========================================================================

export type TagConnectOrCreate = {
    tag: {
        connectOrCreate: {
            where: { name: string }
            create: { name: string; slug: string }
        }
    }
}

export type PostCreateExtendedInput = PostCreateInput & {
    tags?: Array<string | TagConnectOrCreate>
}

export type PostUpdateExtendedInput = PostUpdateInput & {
    tags?: {
        deleteMany?: Record<string, never>
        create?: Array<TagConnectOrCreate>
    }
}