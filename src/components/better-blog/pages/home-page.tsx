"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
    useBetterBlogContext,
    useBlogPath,
    useComponents
} from "@/lib/better-blog/context/better-blog-context"
import { MoreVertical } from "lucide-react"
import { usePosts } from "../../../lib/better-blog/hooks"
import { Button } from "../../ui/button"
import { PostsLoading } from "../loading"
import { PostsList } from "../posts-list"

export function HomePageComponent() {
    const { posts, isLoading, error, loadMore, hasMore, isLoadingMore } = usePosts(
        {}
    )
    const { localization } = useBetterBlogContext()
    const { Link } = useComponents()
    const newPostHref = useBlogPath("new")
    const draftPostsHref = useBlogPath("drafts")

    if (isLoading) return <PostsLoading />

    if (error) {
        return (
            <div className="space-y-4">
                <h2 className="font-semibold text-destructive">
                    Failed to load posts
                </h2>
                <pre className="overflow-auto rounded bg-muted p-3 text-sm">
                    {error.message}
                </pre>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-bold text-4xl tracking-tight">
                        {localization.BLOG_LIST_TITLE}
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        {localization.BLOG_LIST_DESCRIPTION}
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>
                            {localization.BLOG_LIST_MENU_DROPDOWN_LABEL}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={newPostHref}>
                                {
                                    localization.BLOG_LIST_MENU_DROPDOWN_NEW_POST_BUTTON
                                }
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={draftPostsHref}>
                                {
                                    localization.BLOG_LIST_MENU_DROPDOWN_DRAFT_POSTS
                                }
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <PostsList
                posts={posts}
                onLoadMore={loadMore}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
            />
        </div>
    )
}
