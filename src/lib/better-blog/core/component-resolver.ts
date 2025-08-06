import type React from 'react';
import type { RouteMatch } from './types';
import { resolveComponent, resolveLoadingComponent } from './client-components';
import type { PageComponentOverrides } from './client-components';

/**
 * Resolves the component and loading component for a given route match
 * This keeps RouteMatch pure while using client-side component mappings
 */
export function resolveRouteComponents(
  routeMatch: RouteMatch,
  overrides?: PageComponentOverrides
): {
  Component?: React.ComponentType;
  LoadingComponent?: React.ComponentType<Record<string, never>>;
} {
  return {
    Component: resolveComponent(routeMatch.type, overrides),
    LoadingComponent: resolveLoadingComponent(routeMatch.type, overrides)
  };
}

/**
 * Gets just the component for a route match (convenience function)
 */
export function resolveRouteComponent(
  routeMatch: RouteMatch,
  overrides?: PageComponentOverrides
): React.ComponentType | undefined {
  const { Component } = resolveRouteComponents(routeMatch, overrides);
  return Component;
}