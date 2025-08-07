// Client-side component mappings
// This file imports React components and can only be used in client components

import type React from 'react';
import { 
  HomePageComponent,
  PostPageComponent,
  TagPageComponent,
  DraftsPageComponent,
  NewPostPageComponent,
  EditPostPageComponent,
  loadingComponents
} from '../../../components/better-blog/route-components';
import type { RouteMatch } from './types';
import { defaultLoadingComponents } from '@/components/better-blog/loading';


// Default component mappings (excluding 'unknown' type)
export const defaultComponents = {
  home: HomePageComponent,
  post: PostPageComponent,
  tag: TagPageComponent,
  drafts: DraftsPageComponent,
  new: NewPostPageComponent,
  edit: EditPostPageComponent,
} as const;


// Component override interface (simplified - just components)
export interface PageComponentOverrides {
  HomeComponent?: React.ComponentType;
  PostComponent?: React.ComponentType;
  TagComponent?: React.ComponentType;
  DraftsComponent?: React.ComponentType;
  NewPostComponent?: React.ComponentType;
  EditPostComponent?: React.ComponentType;
  
  HomeLoadingComponent?: React.ComponentType<Record<string, never>>;
  PostLoadingComponent?: React.ComponentType<Record<string, never>>;
  TagLoadingComponent?: React.ComponentType<Record<string, never>>;
  DraftsLoadingComponent?: React.ComponentType<Record<string, never>>;
  NewPostLoadingComponent?: React.ComponentType<Record<string, never>>;
  EditPostLoadingComponent?: React.ComponentType<Record<string, never>>;
  
  NotFoundComponent?: React.ComponentType<{ message: string }>;
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
  routeType: RouteMatch['type'],
  overrides?: PageComponentOverrides
): React.ComponentType<Record<string, never>> | undefined {
  // Handle unknown route types early
  if (routeType === 'unknown' || !(routeType in defaultLoadingComponents)) {
    return undefined;
  }
  
  const type = routeType;
  
  // Check for override first
  if (overrides) {
    switch (type) {
      case 'home':
        return overrides.HomeLoadingComponent || defaultLoadingComponents.home;
      case 'post':
        return overrides.PostLoadingComponent || defaultLoadingComponents.post;
      case 'tag':
        return overrides.TagLoadingComponent || defaultLoadingComponents.tag;
      case 'drafts':
        return overrides.DraftsLoadingComponent || defaultLoadingComponents.drafts;
      case 'new':
        return overrides.NewPostLoadingComponent || defaultLoadingComponents.new;
      case 'edit':
        return overrides.EditPostLoadingComponent || defaultLoadingComponents.edit;
    }
  }
  
  // Fall back to default
  return defaultLoadingComponents[type];
}