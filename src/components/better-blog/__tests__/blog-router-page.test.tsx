import React from 'react';
import { render, screen } from '@testing-library/react';
import { BlogRouterPage } from '../blog-router-page';
import { useBlogContext } from '../../../lib/better-blog/core/blog-context';
import { mockPosts } from '../../../test/mocks/data';
import type { RouteMatch } from '../../../lib/better-blog/core/types';

// Mock the blog context hook
jest.mock('../../../lib/better-blog/core/blog-context');
const mockUseBlogContext = useBlogContext as jest.MockedFunction<typeof useBlogContext>;

// Mock the child components to simplify testing
jest.mock('../posts-list', () => ({
  PostsList: ({ posts }: { posts: any[] }) => (
    <div data-testid="posts-list">Posts: {posts.length}</div>
  )
}));

jest.mock('../loading', () => ({
  BlogLoading: () => <div data-testid="blog-loading">Blog Loading...</div>,
  PostLoading: () => <div data-testid="post-loading">Post Loading...</div>,
  PostsLoading: () => <div data-testid="posts-loading">Posts Loading...</div>,
}));

const mockDataAPI = {
  getAllPosts: jest.fn(),
  getPostBySlug: jest.fn(),
  getPostsByTag: jest.fn(),
};

describe('BlogRouterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loading states', () => {
    it('should show posts loading for home route', () => {
      mockUseBlogContext.mockReturnValue({
        routeMatch: { type: 'home', metadata: { title: 'Blog Posts' } },
        data: null,
        isLoading: true,
        error: null,

      });

      render(<BlogRouterPage />);
      expect(screen.getByTestId('posts-loading')).toBeInTheDocument();
    });

    it('should show post loading for post route', () => {
      mockUseBlogContext.mockReturnValue({
        routeMatch: { 
          type: 'post', 
          data: { slug: 'test-post' },
          metadata: { title: 'Test Post' } 
        },
        data: null,
        isLoading: true,
        error: null,

      });

      render(<BlogRouterPage />);
      expect(screen.getByTestId('post-loading')).toBeInTheDocument();
    });

    it('should show blog loading for new route', () => {
      mockUseBlogContext.mockReturnValue({
        routeMatch: { type: 'new', metadata: { title: 'Create New Post' } },
        data: null,
        isLoading: true,
        error: null,

      });

      render(<BlogRouterPage />);
      expect(screen.getByTestId('blog-loading')).toBeInTheDocument();
    });
  });

  describe('error states', () => {
    it('should show error page when there is an error', () => {
      mockUseBlogContext.mockReturnValue({
        routeMatch: { type: 'home', metadata: { title: 'Blog Posts' } },
        data: null,
        isLoading: false,
        error: new Error('Test error'),

      });

      render(<BlogRouterPage />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong: Test error')).toBeInTheDocument();
    });
  });

  describe('route handling', () => {
    it('should render home page with posts list', () => {
      mockUseBlogContext.mockReturnValue({
        routeMatch: { type: 'home', metadata: { title: 'Blog Posts' } },
        data: mockPosts,
        isLoading: false,
        error: null,

      });

      render(<BlogRouterPage />);
      expect(screen.getByText('Blog Posts')).toBeInTheDocument();
      expect(screen.getByTestId('posts-list')).toBeInTheDocument();
      expect(screen.getByText('Posts: 3')).toBeInTheDocument();
    });

    it('should render post detail page', () => {
      mockUseBlogContext.mockReturnValue({
        routeMatch: { 
          type: 'post', 
          data: { slug: 'react-hooks-guide' },
          metadata: { title: 'Test Post' } 
        },
        data: mockPosts[0],
        isLoading: false,
        error: null,

      });

      render(<BlogRouterPage />);
      expect(screen.getByText('Complete Guide to React Hooks')).toBeInTheDocument();
      expect(screen.getByText('By John Doe')).toBeInTheDocument();
      expect(screen.getByText('#React')).toBeInTheDocument();
      expect(screen.getByText('#TypeScript')).toBeInTheDocument();
    });

    it('should render not found for missing post', () => {
      mockUseBlogContext.mockReturnValue({
        routeMatch: { 
          type: 'post', 
          data: { slug: 'missing-post' },
          metadata: { title: 'Missing Post' } 
        },
        data: null,
        isLoading: false,
        error: null,

      });

      render(<BlogRouterPage />);
      expect(screen.getByText('Not Found')).toBeInTheDocument();
      expect(screen.getByText('Post not found')).toBeInTheDocument();
    });

    it('should render tag page with filtered posts', () => {
      const reactPosts = mockPosts.filter(post => 
        post.tags.some(tag => tag.slug === 'react')
      );

      mockUseBlogContext.mockReturnValue({
        routeMatch: { 
          type: 'tag', 
          data: { tag: 'react' },
          metadata: { title: 'Posts tagged: react' } 
        },
        data: reactPosts,
        isLoading: false,
        error: null,

      });

      render(<BlogRouterPage />);
      expect(screen.getByText('Posts tagged: #react')).toBeInTheDocument();
      expect(screen.getByTestId('posts-list')).toBeInTheDocument();
      expect(screen.getByText('Posts: 1')).toBeInTheDocument();
    });

    it('should render drafts page', () => {
      const draftPosts = mockPosts.filter(post => !post.published);

      mockUseBlogContext.mockReturnValue({
        routeMatch: { type: 'drafts', metadata: { title: 'My Drafts' } },
        data: draftPosts,
        isLoading: false,
        error: null,

      });

      render(<BlogRouterPage />);
      expect(screen.getByText('📝 My Drafts')).toBeInTheDocument();
      expect(screen.getByTestId('posts-list')).toBeInTheDocument();
      expect(screen.getByText('Posts: 1')).toBeInTheDocument();
    });

    it('should render new post form', () => {
      mockUseBlogContext.mockReturnValue({
        routeMatch: { type: 'new', metadata: { title: 'Create New Post' } },
        data: null,
        isLoading: false,
        error: null,

      });

      render(<BlogRouterPage />);
      expect(screen.getByText('✏️ Create New Post')).toBeInTheDocument();
      expect(screen.getByText('New post form will be implemented here')).toBeInTheDocument();
    });

    it('should render edit post form', () => {
      mockUseBlogContext.mockReturnValue({
        routeMatch: { 
          type: 'edit', 
          data: { postSlug: 'react-hooks-guide' },
          metadata: { title: 'Editing: react-hooks-guide' } 
        },
        data: mockPosts[0],
        isLoading: false,
        error: null,

      });

      render(<BlogRouterPage />);
      expect(screen.getByText('✏️ Editing: Complete Guide to React Hooks')).toBeInTheDocument();
      expect(screen.getByText('Edit form will be implemented here')).toBeInTheDocument();
    });

    it('should render not found for edit without post data', () => {
      mockUseBlogContext.mockReturnValue({
        routeMatch: { 
          type: 'edit', 
          data: { postSlug: 'missing-post' },
          metadata: { title: 'Editing: missing-post' } 
        },
        data: null,
        isLoading: false,
        error: null,

      });

      render(<BlogRouterPage />);
      expect(screen.getByText('Not Found')).toBeInTheDocument();
      expect(screen.getByText('Post not found for editing')).toBeInTheDocument();
    });

    it('should render not found for unknown route', () => {
      mockUseBlogContext.mockReturnValue({
        routeMatch: { 
          type: 'unknown' as any, 
          metadata: { title: 'Unknown route: /posts/some/invalid/path' } 
        },
        data: null,
        isLoading: false,
        error: null,

      });

      render(<BlogRouterPage />);
      expect(screen.getByText('Not Found')).toBeInTheDocument();
      expect(screen.getByText('Unknown route: /posts/some/invalid/path')).toBeInTheDocument();
    });
  });

  describe('empty data handling', () => {
    it('should handle empty posts array for home', () => {
      mockUseBlogContext.mockReturnValue({
        routeMatch: { type: 'home', metadata: { title: 'Blog Posts' } },
        data: [],
        isLoading: false,
        error: null,

      });

      render(<BlogRouterPage />);
      expect(screen.getByTestId('posts-list')).toBeInTheDocument();
      expect(screen.getByText('Posts: 0')).toBeInTheDocument();
    });

    it('should handle null data for tag route', () => {
      mockUseBlogContext.mockReturnValue({
        routeMatch: { 
          type: 'tag', 
          data: { tag: 'nonexistent' },
          metadata: { title: 'Posts tagged: nonexistent' } 
        },
        data: null,
        isLoading: false,
        error: null,

      });

      render(<BlogRouterPage />);
      expect(screen.getByText('Posts tagged: #nonexistent')).toBeInTheDocument();
      expect(screen.getByTestId('posts-list')).toBeInTheDocument();
      expect(screen.getByText('Posts: 0')).toBeInTheDocument();
    });
  });
});