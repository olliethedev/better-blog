"use client"

import { Badge } from "@/components/ui/badge"
import { formatDate } from "date-fns"
import {
    useBlogContext,
    useBlogPath,
    useComponents
} from "../../../lib/better-blog/context/better-blog-context"
import { useRoute } from "../../../lib/better-blog/context/route-context"
import { usePost } from "../../../lib/better-blog/hooks"
import { EmptyList } from "../empty-list"
import { PostLoading } from "../loading"
import { MarkdownContent } from "../markdown-content"
import { PageHeader } from "../page-header"
import { PageWrapper } from "./page-wrapper"

export function PostPageComponent() {
    const { routeMatch } = useRoute()
    const { post, isLoading, error } = usePost(routeMatch.params?.slug)
    const { localization } = useBlogContext()
    const { Link, Image } = useComponents()
    const blogPath = useBlogPath

    if (isLoading) return <PostLoading />

    if (error || !post) {
        return <EmptyList message={localization.POST_NOT_FOUND_DESCRIPTION} />
    }

    return (
        <PageWrapper className="gap-6">
            <PageHeader title={post.title} description={post.excerpt} />

            <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                    {post.author && post.author.name !== "Unknown" && (
                        <span className="font-medium text-sm">
                            {post.author.name}
                        </span>
                    )}
                    <span className="font-light text-muted-foreground text-sm">
                        {formatDate(post.createdAt, "MMMM d, yyyy")}
                    </span>
                </div>

                <div className="flex flex-row flex-wrap justify-center gap-2">
                    {post.tags.map((tag) => (
                        <Badge
                            asChild
                            key={tag.id}
                            className="tag"
                            variant="secondary"
                        >
                            <Link href={blogPath("tag", tag.slug)}>
                                {tag.name}
                            </Link>
                        </Badge>
                    ))}
                </div>

                {post.image && (
                    <Image
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        width={1000}
                        height={600}
                    />
                )}
            </div>

            <MarkdownContent markdown={post.content} />
        </PageWrapper>
    )
}
