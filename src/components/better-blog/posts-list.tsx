import { useBetterBlogContext } from "../../lib/better-blog/context/better-blog-context"
import type { Post } from "../../lib/better-blog/core/types"
import { Button } from "../ui/button"
import { PostCard } from "./post-card"
import SearchInput from "./search-input"

interface PostsListProps {
    posts: Post[]
    onLoadMore?: () => void
    hasMore?: boolean
    isLoadingMore?: boolean
}

export function PostsList({
    posts,
    onLoadMore,
    hasMore,
    isLoadingMore
}: PostsListProps) {
    const { localization } = useBetterBlogContext()
    if (posts.length === 0) {
        return <div>{localization.BLOG_LIST_EMPTY}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-center pb-6">
                <SearchInput
                    placeholder={localization.BLOG_LIST_SEARCH_PLACEHOLDER}
                    buttonText={localization.BLOG_LIST_SEARCH_BUTTON}
                    emptyMessage={localization.BLOG_LIST_SEARCH_EMPTY}
                />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            {onLoadMore && hasMore && (
                <div className="flex justify-center">
                    <Button
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                        variant="outline"
                        size="lg"
                    >
                        {isLoadingMore
                            ? localization.BLOG_LIST_LOADING_MORE
                            : localization.BLOG_LIST_LOAD_MORE}
                    </Button>
                </div>
            )}
        </div>
    )
}
