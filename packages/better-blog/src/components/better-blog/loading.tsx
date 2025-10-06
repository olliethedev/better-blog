// Loading components are now defined in individual routes via yar
// Users can create custom routes with their own loading states

import { FormPageSkeleton } from "./form-page-skeleton"
import { ListPageSkeleton } from "./list-page-skeleton"
import { PostPageSkeleton } from "./post-page-skeleton"

export { FormPageSkeleton, ListPageSkeleton, PostPageSkeleton }

// Export default loading components for backward compatibility
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
