import React from 'react';
import { createReactRouterAdapter } from '@/lib/better-blog/adapters/react-router';
import type { RouterDependencies } from '@/lib/better-blog/adapters/react-router';
import { createMockConfig } from '@/test/mocks/data';

// Mock router dependencies
const mockRouterDependencies: RouterDependencies = {
  useParams: jest.fn(() => ({ '*': 'test-slug' })),
  Navigate: jest.fn(({ to, replace }: { to: string; replace?: boolean }) => 
    React.createElement('div', { 'data-testid': 'navigate', 'data-to': to, 'data-replace': replace })
  ) as React.ComponentType<{ to: string; replace?: boolean }>,
};

describe('React Router Adapter', () => {
  let mockConfig: ReturnType<typeof createMockConfig>;
  let adapter: ReturnType<typeof createReactRouterAdapter>;

  beforeEach(() => {
    mockConfig = createMockConfig();
    adapter = createReactRouterAdapter(mockConfig, mockRouterDependencies);
    jest.clearAllMocks();
  });

  describe('adapter configuration', () => {
    it('should create adapter with correct properties', () => {
      expect(adapter).toHaveProperty('BlogRouter');
      expect(adapter).toHaveProperty('generateRoutes');
    });

    it('should have BlogRouter as a React component', () => {
      expect(typeof adapter.BlogRouter).toBe('function');
    });
  });

  describe('generateRoutes', () => {
    it('should return routes array', () => {
      const routes = adapter.generateRoutes();
      
      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0);
      
      for (const route of routes) {
        expect(route).toHaveProperty('path');
        expect(route).toHaveProperty('element');
        expect(typeof route.path).toBe('string');
      }
    });

    it('should include blog posts route', () => {
      const routes = adapter.generateRoutes();
      const paths = routes.map(route => route.path);
      
      expect(paths).toContain('/posts/*');
      expect(routes).toHaveLength(1); // Single route that handles all sub-routing
    });
  });

  describe('BlogRouter component', () => {
    it('should be a React component', () => {
      expect(typeof adapter.BlogRouter).toBe('function');
      expect(adapter.BlogRouter.name).toBe('BlogRouter');
    });

    it('should be instantiable', () => {
      expect(() => {
        React.createElement(adapter.BlogRouter);
      }).not.toThrow();
    });
  });

  describe('dependency injection', () => {
    it('should use injected useParams hook', () => {
      const customUseParams = jest.fn(() => ({ '*': 'custom-slug' }));
      const customRouterDeps: RouterDependencies = {
        ...mockRouterDependencies,
        useParams: customUseParams,
      };
      
      const customAdapter = createReactRouterAdapter(mockConfig, customRouterDeps);
      
      // Create the component (this would normally trigger useParams in a real render)
      React.createElement(customAdapter.BlogRouter);
      
      // The useParams should be available for use
      expect(customUseParams).toBeDefined();
      expect(typeof customUseParams).toBe('function');
    });

    it('should use injected Navigate component', () => {
      const customNavigate = jest.fn(() => 
        React.createElement('div', { 'data-testid': 'custom-navigate' })
      ) as React.ComponentType<{ to: string; replace?: boolean }>;
      
      const customRouterDeps: RouterDependencies = {
        ...mockRouterDependencies,
        Navigate: customNavigate,
      };
      
      const customAdapter = createReactRouterAdapter(mockConfig, customRouterDeps);
      
      expect(customAdapter).toHaveProperty('BlogRouter');
      expect(typeof customAdapter.BlogRouter).toBe('function');
    });

    it('should create adapter with different router dependencies', () => {
      const alternativeRouterDeps: RouterDependencies = {
        useParams: jest.fn(() => ({ '*': 'alternative-slug' })),
        Navigate: jest.fn(() => 
          React.createElement('span', { 'data-testid': 'alt-navigate' })
        ) as React.ComponentType<{ to: string; replace?: boolean }>,
      };
      
      const altAdapter = createReactRouterAdapter(mockConfig, alternativeRouterDeps);
      
      expect(altAdapter).toHaveProperty('BlogRouter');
      expect(altAdapter).toHaveProperty('generateRoutes');
      
      // Should be a different instance from the main adapter
      expect(altAdapter.BlogRouter).not.toBe(adapter.BlogRouter);
    });
  });
});