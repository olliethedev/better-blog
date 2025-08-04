import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createNextJsAdapter } from '@/lib/better-blog/adapters/nextjs';
import { createMockConfig } from '@/test/mocks/data';
import type { ComponentsContextValue } from '@/components/better-blog/components-context';

// Mock components for testing
const mockComponents: ComponentsContextValue = {
  Link: ({ href, children, className }) => (
    <a href={href} className={className}>{children}</a>
  ),
  Image: ({ src, alt, className }) => (
    <img src={src} alt={alt} className={className} />
  ),
};

describe('NextJS Adapter', () => {
  let mockConfig: ReturnType<typeof createMockConfig>;
  let adapter: ReturnType<typeof createNextJsAdapter>;

  beforeEach(() => {
    mockConfig = createMockConfig();
    adapter = createNextJsAdapter(mockConfig);
  });

  describe('adapter configuration', () => {
    it('should create adapter with correct properties', () => {
      expect(adapter).toHaveProperty('dynamicParams');
      expect(adapter).toHaveProperty('generateStaticParams');
      expect(adapter).toHaveProperty('generateMetadata');
      expect(adapter).toHaveProperty('Entry');
    });

    it('should have dynamicParams set to true', () => {
      expect(adapter.dynamicParams).toBe(true);
    });
  });

  describe('generateStaticParams', () => {
    it('should return static params array', () => {
      const result = adapter.generateStaticParams();
      
      expect(result).toEqual([
        { all: [] },
        { all: ['new'] },
        { all: ['drafts'] }
      ]);
    });
  });

  describe('generateMetadata', () => {
    it('should generate metadata for home route', async () => {
      const params = Promise.resolve({ all: [] });
      const result = await adapter.generateMetadata({ params });
      
      expect(result).toEqual({
        title: 'Blog Posts',
        description: 'Latest blog posts'
      });
    });

    it('should generate metadata for post route', async () => {
      const params = Promise.resolve({ all: ['react-hooks-guide'] });
      const result = await adapter.generateMetadata({ params });
      
      expect(result).toEqual({
        title: 'Post: react-hooks-guide'
      });
    });

    it('should generate metadata for new post route', async () => {
      const params = Promise.resolve({ all: ['new'] });
      const result = await adapter.generateMetadata({ params });
      
      expect(result).toEqual({
        title: 'Create New Post'
      });
    });
  });

  describe('Entry component', () => {
    it('should be a React component', () => {
      expect(typeof adapter.Entry).toBe('function');
      expect(adapter.Entry.name).toBe('BlogEntry');
    });

    it('should accept params and components props', () => {
      const params = Promise.resolve({ all: [] });
      
      // Test that the component can be instantiated
      expect(() => {
        React.createElement(adapter.Entry, { params, components: mockComponents });
      }).not.toThrow();
    });

    it('should render without throwing when given valid props', () => {
      const params = Promise.resolve({ all: [] });
      
      expect(() => {
        render(React.createElement(adapter.Entry, { params, components: mockComponents }));
      }).not.toThrow();
    });
  });
});