import type { PageComponentOverrides, RouteMatch } from "@/types"

import {
    DraftsPageComponent,
    EditPostPageComponent,
    HomePageComponent,
    NewPostPageComponent,
    PostPageComponent,
    TagPageComponent
} from "@/components/better-blog/pages"

// Default component mappings (excluding 'unknown' type)
const defaultComponents = {
    home: HomePageComponent,
    post: PostPageComponent,
    tag: TagPageComponent,
    drafts: DraftsPageComponent,
    new: NewPostPageComponent,
    edit: EditPostPageComponent
} as const

/**
 * Resolves the final component for a route type, applying overrides
 */
export function resolvePageComponent(
    routeType: RouteMatch["type"],
    overrides?: PageComponentOverrides
): React.ComponentType | undefined {
    // Handle unknown route types early
    if (routeType === "unknown" || !(routeType in defaultComponents)) {
        return undefined
    }

    const type = routeType

    // Check for override first
    if (overrides) {
        switch (type) {
            case "home":
                return overrides.HomeComponent || defaultComponents.home
            case "post":
                return overrides.PostComponent || defaultComponents.post
            case "tag":
                return overrides.TagComponent || defaultComponents.tag
            case "drafts":
                return overrides.DraftsComponent || defaultComponents.drafts
            case "new":
                return overrides.NewPostComponent || defaultComponents.new
            case "edit":
                return overrides.EditPostComponent || defaultComponents.edit
        }
    }

    // Fall back to default
    return defaultComponents[type]
}
