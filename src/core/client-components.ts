// Client-side component mappings
// This file imports React components and can only be used in client components

import { defaultLoadingComponents } from "@/components/better-blog/loading"
import type React from 'react';
import {
    DraftsPageComponent,
    EditPostPageComponent,
    HomePageComponent,
    NewPostPageComponent,
    PostPageComponent,
    TagPageComponent
} from "../components/better-blog/pages"
import type { RouteMatch } from "./types"


// Default component mappings (excluding 'unknown' type)
export const defaultComponents = {
  home: HomePageComponent,
  post: PostPageComponent,
  tag: TagPageComponent,
  drafts: DraftsPageComponent,
  new: NewPostPageComponent,
  edit: EditPostPageComponent,
} as const;


// Component override interface
export interface PageComponentOverrides {
    HomeComponent?: React.ComponentType
    PostComponent?: React.ComponentType
    TagComponent?: React.ComponentType
    DraftsComponent?: React.ComponentType
    NewPostComponent?: React.ComponentType
    EditPostComponent?: React.ComponentType

    HomeLoadingComponent?: React.ComponentType
    PostLoadingComponent?: React.ComponentType
    TagLoadingComponent?: React.ComponentType
    DraftsLoadingComponent?: React.ComponentType
    NewPostLoadingComponent?: React.ComponentType
    EditPostLoadingComponent?: React.ComponentType

    NotFoundComponent?: React.ComponentType<{ message: string }>
}

/**
 * Resolves the final component for a route type, applying overrides
 */
export function resolveComponent(
  routeType: RouteMatch['type'],
  overrides?: PageComponentOverrides
): React.ComponentType | undefined {
  // Handle unknown route types early
  if (routeType === 'unknown' || !(routeType in defaultComponents)) {
    return undefined;
  }
  
  const type = routeType;
  
  // Check for override first
  if (overrides) {
    switch (type) {
      case 'home':
        return overrides.HomeComponent || defaultComponents.home;
      case 'post':
        return overrides.PostComponent || defaultComponents.post;
      case 'tag':
        return overrides.TagComponent || defaultComponents.tag;
      case 'drafts':
        return overrides.DraftsComponent || defaultComponents.drafts;
      case 'new':
        return overrides.NewPostComponent || defaultComponents.new;
      case 'edit':
        return overrides.EditPostComponent || defaultComponents.edit;
    }
  }
  
  // Fall back to default
  return defaultComponents[type];
}

/**
 * Resolves the final loading component for a route type, applying overrides
 */
export function resolveLoadingComponent(
    routeType: RouteMatch["type"],
    overrides?: PageComponentOverrides
): React.ComponentType | undefined {
    // Handle unknown route types early
    if (routeType === "unknown" || !(routeType in defaultLoadingComponents)) {
        return undefined
    }

    const type = routeType

    // Check for override first
    if (overrides) {
        switch (type) {
            case "home":
                return (
                    overrides.HomeLoadingComponent ||
                    defaultLoadingComponents.home
                )
            case "post":
                return (
                    overrides.PostLoadingComponent ||
                    defaultLoadingComponents.post
                )
            case "tag":
                return (
                    overrides.TagLoadingComponent ||
                    defaultLoadingComponents.tag
                )
            case "drafts":
                return (
                    overrides.DraftsLoadingComponent ||
                    defaultLoadingComponents.drafts
                )
            case "new":
                return (
                    overrides.NewPostLoadingComponent ||
                    defaultLoadingComponents.new
                )
            case "edit":
                return (
                    overrides.EditPostLoadingComponent ||
                    defaultLoadingComponents.edit
                )
        }
    }

    // Fall back to default
    return defaultLoadingComponents[type]
}