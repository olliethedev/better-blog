import { render, screen } from '@testing-library/react';
import { BlogLoading, PostLoading, PostsLoading } from '@/components/better-blog/loading';

describe('Loading Components', () => {
  describe('BlogLoading', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<BlogLoading />);
      }).not.toThrow();
    });

    it('should display default loading text', () => {
      render(<BlogLoading />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should display custom loading message', () => {
      render(<BlogLoading message="Custom loading..." />);
      expect(screen.getByText('Custom loading...')).toBeInTheDocument();
    });

    it('should have correct CSS class', () => {
      const { container } = render(<BlogLoading />);
      expect(container.querySelector('.blog-loading')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
    });
  });

  describe('PostLoading', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<PostLoading />);
      }).not.toThrow();
    });

    it('should display loading text', () => {
      render(<PostLoading />);
      expect(screen.getByText('Loading post...')).toBeInTheDocument();
    });

    it('should have correct CSS class', () => {
      const { container } = render(<PostLoading />);
      expect(container.querySelector('.blog-loading')).toBeInTheDocument();
    });
  });

  describe('PostsLoading', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<PostsLoading />);
      }).not.toThrow();
    });

    it('should display loading text', () => {
      render(<PostsLoading />);
      expect(screen.getByText('Loading posts...')).toBeInTheDocument();
    });

    it('should have correct CSS class', () => {
      const { container } = render(<PostsLoading />);
      expect(container.querySelector('.blog-loading')).toBeInTheDocument();
    });
  });

  describe('All loading components', () => {
    it('should render loading spinner', () => {
      const { rerender, container } = render(<BlogLoading />);
      expect(container.querySelector('.loading-spinner')).toBeInTheDocument();

      rerender(<PostLoading />);
      expect(container.querySelector('.loading-spinner')).toBeInTheDocument();

      rerender(<PostsLoading />);
      expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
    });
  });
});