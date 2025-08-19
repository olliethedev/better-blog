import { z } from "zod"

// Base create schema for Post forms
// Includes meta fields so the form can safely omit them
export const PostCreateWithoutRefineSchema = z.object({
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
export const PostUpdateWithoutRefineSchema = z.object({
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

export type PostCreateWithoutRefineInput = z.infer<
    typeof PostCreateWithoutRefineSchema
>
export type PostUpdateWithoutRefineInput = z.infer<
    typeof PostUpdateWithoutRefineSchema
>

// Shared query schema for listing posts via API
export const PostListQuerySchema = z.object({
    slug: z.string().optional(),
    tag: z.string().optional(),
    offset: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    query: z.string().optional()
})

export type PostListQueryInput = z.infer<typeof PostListQuerySchema>