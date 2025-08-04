import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BlogProvider } from '../providers/blog-provider';
import { useBlogContext } from '../core/blog-context';
import { createMockConfig, mockPosts } from '../../../test/mocks/data';
import type { RouteMatch } from '../core/types';
import type { ComponentsContextValue } from '../../../components/better-blog/components-context';

// Mock components for testing
const mockComponents: ComponentsContextValue = {
  Link: ({ href, children, className }) => (
    <a href={href} className={className}>{children}</a>
  ),
  Image: ({ src, alt, className }) => (
    <img src={src} alt={alt} className={className} />
  ),
};

// Test component that uses the blog context
function TestComponent() {
  const { routeMatch, data, isLoading, error } = useBlogContext();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <div data-testid="route-type">{routeMatch.type}</div>
      <div data-testid="route-title">{routeMatch.metadata.title}</div>
      {data && Array.isArray(data) ? (
        <div data-testid="posts-count">{data.length}</div>
      ) : null}
      {data && !Array.isArray(data) && typeof data === 'object' && data !== null && 'title' in data ? (
        <div data-testid="post-title">{(data as { title: string }).title}</div>
      ) : null}
    </div>
  );
}

function renderWithProvider(routeMatch: RouteMatch) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // Simulate server-side prefetching by manually populating cache
  const queryKey = ['blog', routeMatch.type, routeMatch.data];
  let cachedData: unknown;

  switch (routeMatch.type) {
    case 'home':
      cachedData = mockPosts;
      break;
    case 'post':
      if (routeMatch.data?.slug === 'react-hooks') {
        cachedData = mockPosts[0]; // The React Hooks post
      } else {
        cachedData = null; // Non-existent post
      }
      break;
    case 'tag':
      if (routeMatch.data?.tag === 'react') {
        cachedData = [mockPosts[0]]; // Only posts with react tag
      } else {
        cachedData = [];
      }
      break;
    case 'drafts':
      cachedData = mockPosts.filter(post => !post.published);
      break;
    case 'edit':
      if (routeMatch.data?.postSlug === 'react-hooks') {
        cachedData = mockPosts[0]; // The post to edit
      } else {
        cachedData = null;
      }
      break;
    case 'new':
      cachedData = null; // No data needed for new post
      break;
    default:
      cachedData = null;
  }

  // Prefill the cache with the data
  queryClient.setQueryData(queryKey, cachedData);

  return render(
    <QueryClientProvider client={queryClient}>
      <BlogProvider
        routeMatch={routeMatch}
        components={mockComponents}
      >
        <TestComponent />
      </BlogProvider>
    </QueryClientProvider>
  );
}

describe('BlogProvider', () => {
  beforeEach(() => {
    // Reset any module mocks
    jest.clearAllMocks();
  });

  describe('home route', () => {
    it('should provide home route data', async () => {
      const homeRoute: RouteMatch = {
        type: 'home',
        metadata: { title: 'Blog Posts', description: 'Latest blog posts' }
      };

      renderWithProvider(homeRoute);

      // No loading state - data should be immediately available from cache
      await waitFor(() => {
        expect(screen.getByTestId('route-type')).toHaveTextContent('home');
        expect(screen.getByTestId('route-title')).toHaveTextContent('Blog Posts');
        expect(screen.getByTestId('posts-count')).toHaveTextContent('3');
      });
    });
  });

  describe('post route', () => {
    it('should provide post route data', async () => {
      const postRoute: RouteMatch = {
        type: 'post',
        data: { slug: 'react-hooks-guide' },
        metadata: { title: 'Post: react-hooks-guide' }
      };

      renderWithProvider(postRoute);

      // No loading state - data should be immediately available from cache
      await waitFor(() => {
        expect(screen.getByTestId('route-type')).toHaveTextContent('post');
        expect(screen.getByTestId('post-title')).toHaveTextContent('Complete Guide to React Hooks');
      });
    });

    it('should handle post not found', async () => {
      const postRoute: RouteMatch = {
        type: 'post',
        data: { slug: 'non-existent-post' },
        metadata: { title: 'Post: non-existent-post' }
      };

      renderWithProvider(postRoute);

      await waitFor(() => {
        expect(screen.getByTestId('route-type')).toHaveTextContent('post');
        // Data should be null for non-existent post
        expect(screen.queryByTestId('post-title')).not.toBeInTheDocument();
      });
    });
  });

  describe('tag route', () => {
    it('should provide tag route data', async () => {
      const tagRoute: RouteMatch = {
        type: 'tag',
        data: { tag: 'react' },
        metadata: { title: 'Posts tagged: react' }
      };

      renderWithProvider(tagRoute);

      await waitFor(() => {
        expect(screen.getByTestId('route-type')).toHaveTextContent('tag');
        expect(screen.getByTestId('posts-count')).toHaveTextContent('1'); // Only one post with react tag
      });
    });
  });

  describe('drafts route', () => {
    it('should provide drafts route data', async () => {
      const draftsRoute: RouteMatch = {
        type: 'drafts',
        metadata: { title: 'My Drafts' }
      };

      renderWithProvider(draftsRoute);

      await waitFor(() => {
        expect(screen.getByTestId('route-type')).toHaveTextContent('drafts');
        expect(screen.getByTestId('posts-count')).toHaveTextContent('1'); // Only one unpublished post
      });
    });
  });

  describe('new route', () => {
    it('should provide new route data', async () => {
      const newRoute: RouteMatch = {
        type: 'new',
        metadata: { title: 'Create New Post' }
      };

      renderWithProvider(newRoute);

      await waitFor(() => {
        expect(screen.getByTestId('route-type')).toHaveTextContent('new');
        expect(screen.getByTestId('route-title')).toHaveTextContent('Create New Post');
        // No data needed for new post
        expect(screen.queryByTestId('posts-count')).not.toBeInTheDocument();
        expect(screen.queryByTestId('post-title')).not.toBeInTheDocument();
      });
    });
  });

  describe('edit route', () => {
    it('should provide edit route data', async () => {
      const editRoute: RouteMatch = {
        type: 'edit',
        data: { postSlug: 'react-hooks-guide' },
        metadata: { title: 'Editing: react-hooks-guide' }
      };

      renderWithProvider(editRoute);

      await waitFor(() => {
        expect(screen.getByTestId('route-type')).toHaveTextContent('edit');
        expect(screen.getByTestId('post-title')).toHaveTextContent('Complete Guide to React Hooks');
      });
    });
  });

  describe.skip('error handling', () => {
      it('should handle missing required data', async () => {
    const invalidPostRoute: RouteMatch = {
      type: 'post',
      data: {}, // Missing slug
      metadata: { title: 'Invalid post' }
    };

    renderWithProvider(invalidPostRoute);

    await waitFor(
      () => {
        expect(screen.getByText('Error: Post slug is required')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

      it('should handle API errors', async () => {
    const mockConfigWithError = createMockConfig({
      getAllPosts: jest.fn().mockRejectedValue(new Error('API Error'))
    });

    const homeRoute: RouteMatch = {
      type: 'home',
      metadata: { title: 'Blog Posts' }
    };

    renderWithProvider(homeRoute);

    await waitFor(
      () => {
        expect(screen.getByText('Error: API Error')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
  });
});