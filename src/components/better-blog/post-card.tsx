"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    useBlogContext,
    useBlogPath,
    useComponents
} from "@/context/better-blog-context"
import type { Post } from "@/core/types"
import { formatDate } from "date-fns"
import { CalendarIcon, ImageIcon } from "lucide-react"
import { ArrowRightIcon } from "lucide-react"

export function PostCard({
    post
}: {
    post: Post
}) {
    const { Link, Image } = useComponents()
    const { localization } = useBlogContext()
    const blogPath = useBlogPath
    const publishedDate = post.publishedAt || post.createdAt

    return (
        <Card className="group relative flex h-full flex-col gap-2 pt-0 pb-4 transition-shadow duration-200 hover:shadow-lg">
            {/* Featured Image or Placeholder */}
            <Link
                href={blogPath(post.slug)}
                className="relative block h-48 w-full overflow-hidden rounded-t-xl bg-muted"
            >
                {post.image ? (
                    <Image
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        width={500}
                        height={300}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                        <ImageIcon className="size-18" />
                    </div>
                )}
            </Link>

            {!post.published && (
                <Badge
                    variant="destructive"
                    className="absolute top-2 left-2 text-xs"
                >
                    {localization.BLOG_CARD_DRAFT_BADGE}
                </Badge>
            )}

            <CardHeader className="flex-1">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
                    <CalendarIcon className="h-3 w-3" />
                    <time dateTime={publishedDate?.toISOString()}>
                        {formatDate(
                            publishedDate || new Date(),
                            "MMMM d, yyyy"
                        )}
                    </time>
                </div>

                <CardTitle className="line-clamp-2 text-lg leading-tight transition-colors">
                    <Link
                        href={blogPath(post.slug)}
                        className="hover:underline"
                    >
                        {post.title}
                    </Link>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4">
                {post.excerpt && (
                    <CardDescription className="mt-2 line-clamp-3">
                        {post.excerpt}
                    </CardDescription>
                )}
            </CardContent>

            <CardFooter>
                <div className="flex w-full items-center justify-between">
                    <Button
                        asChild
                        variant="link"
                        className="px-0 has-[>svg]:px-0"
                    >
                        <Link href={blogPath(post.slug)}>
                            {localization.BLOG_CARD_READ_MORE}
                            <ArrowRightIcon className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
