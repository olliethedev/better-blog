// Re-export loading components from the server-safe loading resolver
// This maintains backward compatibility while ensuring the components
// can be used on both client and server in Next.js
export {
    FormLoading,
    PostsLoading,
    PostLoading
} from "@/router/loading-resolver"

import {
    FormLoading,
    PostLoading,
    PostsLoading
} from "@/router/loading-resolver"
// For backward compatibility, we'll keep the defaultLoadingComponents export
// but import it from the loading resolver
import type { RouteMatch } from "@/types"

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
