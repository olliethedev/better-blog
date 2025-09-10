"use client"
import {
    PostCreateSchema,
    PostUpdateSchema
} from "@/lib/better-blog/schema/post"

import { Button } from "@/components/ui/button"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useBetterBlogContext } from "@/lib/better-blog/context/better-blog-context"
import { useCreatePost, usePost, useUpdatePost } from "@/lib/better-blog/hooks"
import { slugify } from "@/lib/format-utils"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { memo, useMemo, useState } from "react"
import {
    type FieldPath,
    type SubmitHandler,
    type UseFormReturn,
    useForm
} from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { FeaturedImageField } from "./image-field"
import { MarkdownEditor } from "./markdown-editor"
import { TagsMultiSelect } from "./tags-multi-select"

type CommonPostFormValues = {
    title: string
    content: string
    excerpt?: string
    slug?: string
    image?: string
    published?: boolean
    tagNames?: string
}

function PostFormBody<T extends CommonPostFormValues>({
    form,
    onSubmit,
    submitLabel,
    onCancel,
    disabled,
    errorMessage,
    setFeaturedImageUploading
}: {
    form: UseFormReturn<T>
    onSubmit: SubmitHandler<T>
    submitLabel: string
    onCancel: () => void
    disabled: boolean
    errorMessage?: string
    setFeaturedImageUploading: (uploading: boolean) => void
}) {
    const nameTitle = "title" as FieldPath<T>
    const nameSlug = "slug" as FieldPath<T>
    const nameExcerpt = "excerpt" as FieldPath<T>
    const nameImage = "image" as FieldPath<T>
    const nameTagNames = "tagNames" as FieldPath<T>
    const nameContent = "content" as FieldPath<T>
    const namePublished = "published" as FieldPath<T>
    return (
        <Form {...form}>
            <form
                className="w-full space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                {errorMessage && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-600 text-sm">
                        {errorMessage}
                    </div>
                )}

                <FormField
                    control={form.control}
                    name={nameTitle}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Title
                                <span className="text-destructive"> *</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your post title..."
                                    {...field}
                                    value={String(field.value ?? "")}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={nameSlug}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="url-friendly-slug"
                                    {...field}
                                    value={String(field.value ?? "")}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={nameExcerpt}
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Excerpt</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Brief summary of your post..."
                                    className="min-h-20"
                                    value={String(field.value ?? "")}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormDescription />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={nameImage}
                    render={({ field }) => (
                        <FeaturedImageField
                            isRequired={false}
                            value={String(field.value ?? "")}
                            onChange={field.onChange}
                            setFeaturedImageUploading={
                                setFeaturedImageUploading
                            }
                        />
                    )}
                />

                <FormField
                    control={form.control}
                    name={nameTagNames}
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                                <TagsMultiSelect
                                    value={String(field.value ?? "")}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormDescription />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={nameContent}
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>
                                Content
                                <span className="text-destructive"> *</span>
                            </FormLabel>
                            <FormControl>
                                <MarkdownEditor
                                    className="min-h-80 max-w-full"
                                    value={
                                        typeof field.value === "string"
                                            ? field.value
                                            : ""
                                    }
                                    onChange={(content: string) => {
                                        field.onChange(content)
                                    }}
                                />
                            </FormControl>
                            <FormDescription />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={namePublished}
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Published</FormLabel>
                                <FormDescription>
                                    Toggle to publish immediately
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={disabled}>
                        {submitLabel}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={disabled}
                        type="button"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    )
}

const CustomPostCreateSchema = PostCreateSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    authorId: true,
    publishedAt: true,
    tags: true
}).extend({
    tagNames: z.string().optional() // TagNames as comma-separated string
})

const CustomPostUpdateSchema = PostUpdateSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    authorId: true,
    publishedAt: true,
    tags: true
}).extend({
    tagNames: z.string().optional() // TagNames as comma-separated string
})

type AddPostFormProps = {
    onClose: () => void
    onSuccess: () => void
}

const addPostFormPropsAreEqual = (
    prevProps: AddPostFormProps,
    nextProps: AddPostFormProps
): boolean => {
    if (prevProps.onClose !== nextProps.onClose) return false
    if (prevProps.onSuccess !== nextProps.onSuccess) return false
    return true
}

const AddPostFormComponent = ({ onClose, onSuccess }: AddPostFormProps) => {
    const [featuredImageUploading, setFeaturedImageUploading] = useState(false)

    const { uploadImage } = useBetterBlogContext()

    const schema = CustomPostCreateSchema

    const {
        mutateAsync: createPost,
        isPending: isCreatingPost,
        error: createPostError
    } = useCreatePost()

    type AddPostFormValues = z.input<typeof schema>
    const onSubmit = async (data: AddPostFormValues) => {
        // Auto-generate slug from title if not provided
        const slug = data.slug || slugify(data.title)

        await createPost({
            title: data.title,
            content: data.content,
            excerpt: data.excerpt ?? "",
            slug,
            published: data.published ?? false,
            publishedAt: data.published ? new Date() : undefined,
            image: data.image,
            tags: data.tagNames
                ? data.tagNames
                      .split(",")
                      .map((tagName) => tagName.trim())
                      .filter(Boolean)
                      .map((tagName) => ({
                          tag: {
                              connectOrCreate: {
                                  where: {
                                      name: tagName.toLowerCase()
                                  },
                                  create: {
                                      name: tagName.toLowerCase(),
                                      slug: slugify(tagName)
                                  }
                              }
                          }
                      }))
                : []
        })
        toast.success("Post created successfully")
        onSuccess()
    }

    // For compatibility with resolver types that require certain required fields,
    // cast the generics to the exact inferred input type to avoid mismatch on optional slug
    const form = useForm<z.input<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "",
            content: "",
            excerpt: "",
            slug: undefined,
            published: false,
            image: "",
            tagNames: ""
        }
    })

    return (
        <PostFormBody
            form={form}
            onSubmit={onSubmit}
            submitLabel={isCreatingPost ? "Creating..." : "Create Post"}
            onCancel={onClose}
            disabled={isCreatingPost || featuredImageUploading}
            errorMessage={createPostError?.message}
            setFeaturedImageUploading={setFeaturedImageUploading}
        />
    )
}

export const AddPostForm = memo(AddPostFormComponent, addPostFormPropsAreEqual)

type EditPostFormProps = {
    postSlug: string
    onClose: () => void
    onSuccess: () => void
}

const editPostFormPropsAreEqual = (
    prevProps: EditPostFormProps,
    nextProps: EditPostFormProps
): boolean => {
    if (prevProps.postSlug !== nextProps.postSlug) return false
    if (prevProps.onClose !== nextProps.onClose) return false
    if (prevProps.onSuccess !== nextProps.onSuccess) return false
    return true
}

const EditPostFormComponent = ({
    postSlug,
    onClose,
    onSuccess
}: EditPostFormProps) => {
    const [featuredImageUploading, setFeaturedImageUploading] = useState(false)
    const { uploadImage } = useBetterBlogContext()

    const { post } = usePost(postSlug)

    const initialData = useMemo(() => {
        if (!post) return {}
        return {
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            slug: post.slug,
            published: post.published,
            image: post.image || "",
            tagNames: post.tags?.map((tag) => tag.name).join(", ") || ""
        }
    }, [post])

    const schema = CustomPostUpdateSchema

    const {
        mutateAsync: updatePost,
        isPending: isUpdatingPost,
        error: updatePostError
    } = useUpdatePost()

    type EditPostFormValues = z.input<typeof schema>
    const onSubmit = async (data: EditPostFormValues) => {
        await updatePost({
            slug: postSlug,
            data: {
                title: data.title,
                content: data.content,
                excerpt: data.excerpt ?? "",
                slug: data.slug,
                published: data.published,
                publishedAt:
                    data.published && !post?.published
                        ? new Date()
                        : post?.publishedAt,
                image: data.image,
                tags: data.tagNames
                    ? {
                          deleteMany: {}, // Delete all existing tags
                          create: data.tagNames
                              .split(",")
                              .map((tagName) => tagName.trim())
                              .filter(Boolean)
                              .map((tagName) => ({
                                  tag: {
                                      connectOrCreate: {
                                          where: {
                                              name: tagName.toLowerCase()
                                          },
                                          create: {
                                              name: tagName.toLowerCase(),
                                              slug: slugify(tagName)
                                          }
                                      }
                                  }
                              }))
                      }
                    : { deleteMany: {} }
            }
        })
        toast.success("Post updated successfully")
        onSuccess()
    }

    // Don't render the form until post data is loaded
    if (!post) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading post...</span>
            </div>
        )
    }

    const form = useForm<z.input<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "",
            content: "",
            excerpt: "",
            slug: "",
            published: false,
            image: "",
            tagNames: ""
        },
        values: initialData as z.input<typeof schema>
    })

    return (
        <PostFormBody
            form={form}
            onSubmit={onSubmit}
            submitLabel={isUpdatingPost ? "Updating..." : "Update Post"}
            onCancel={onClose}
            disabled={isUpdatingPost || featuredImageUploading}
            errorMessage={updatePostError?.message}
            setFeaturedImageUploading={setFeaturedImageUploading}
        />
    )
}

export const EditPostForm = memo(
    EditPostFormComponent,
    editPostFormPropsAreEqual
)
