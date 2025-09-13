import { FormPageSkeleton } from "../../components/better-blog/form-page-skeleton"
import { ListPageSkeleton } from "../../components/better-blog/list-page-skeleton"
import { PostPageSkeleton } from "../../components/better-blog/post-page-skeleton"
import type { RouteMatch } from "../../core/types"

export function FormLoading() {
    return (
        <div data-testid="form-skeleton">
            <FormPageSkeleton />
        </div>
    )
}

export function PostsLoading() {
    return (
        <div data-testid="posts-skeleton">
            <ListPageSkeleton />
        </div>
    )
}

export function PostLoading() {
    return (
        <div data-testid="post-skeleton">
            <PostPageSkeleton />
        </div>
    )
}

export const defaultLoadingComponents: Record<
    RouteMatch["type"],
    React.ComponentType
> = {
    home: PostsLoading,
    post: PostLoading,
    tag: PostsLoading,
    drafts: PostsLoading,
    new: FormLoading,
    edit: FormLoading,
    unknown: PostLoading
} as const
