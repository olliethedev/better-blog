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
  publishedAt: z.date().optional(),
  authorId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
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
  publishedAt: z.date().optional(),
  authorId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

export type PostCreateWithoutRefineInput = z.infer<
  typeof PostCreateWithoutRefineSchema
>
export type PostUpdateWithoutRefineInput = z.infer<
  typeof PostUpdateWithoutRefineSchema
>