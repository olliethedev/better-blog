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
import { Skeleton } from "@/components/ui/skeleton"
import {
    useBlogPath,
    useComponents
} from "@/lib/better-blog/context/better-blog-context"
import type { Post } from "@/lib/better-blog/core/types"
import { formatDistanceToNow } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { ArrowRightIcon } from "lucide-react"

export function PostCard({
    post
}: {
    post: Post
}) {
    const { Link, Image } = useComponents()
    const blogPath = useBlogPath
    const publishedDate = post.publishedAt || post.createdAt

    return (
        <Card className="group relative flex h-full flex-col gap-2 pt-0 pb-4 transition-shadow duration-200 hover:shadow-lg">
            {/* Featured Image or Placeholder */}
            <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-muted">
                {post.image && (
                    <Image
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        width={500}
                        height={300}
                    />
                )}
            </div>

            {!post.published && (
                <Badge
                    variant="destructive"
                    className="absolute top-2 left-2 text-xs"
                >
                    Draft
                </Badge>
            )}

            <CardHeader className="flex-1">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
                    <CalendarIcon className="h-3 w-3" />
                    <time dateTime={publishedDate?.toISOString()}>
                        {formatDistanceToNow(publishedDate || new Date(), {
                            addSuffix: true
                        })}
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
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={blogPath(post.slug)}>
                            Read more
                            <ArrowRightIcon className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

export function PostCardSkeleton() {
    return (
        <Card className="h-full">
            <div className="relative h-48 w-full">
                <Skeleton className="h-full w-full rounded-t-xl" />
            </div>
            <CardHeader>
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="mb-2 h-6 w-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-32" />
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-center justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-20" />
                </div>
            </CardFooter>
        </Card>
    )
}
