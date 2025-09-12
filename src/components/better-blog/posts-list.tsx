import {
    useBlogContext,
    useComponents
} from "../../lib/better-blog/context/better-blog-context"
import type { Post } from "../../lib/better-blog/core/types"
import { Button } from "../ui/button"
import { EmptyList } from "./empty-list"
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
    const { localization } = useBlogContext()
    const { PostCard } = useComponents()
    if (posts.length === 0) {
        return <EmptyList message={localization.BLOG_LIST_EMPTY} />
    }

    return (
        <div className="w-full space-y-6">
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
