import { render, screen } from '@testing-library/react';
import { PostsList } from '@/components/better-blog/posts-list';
import { mockPosts } from '@/test/mocks/data';

describe('PostsList Component', () => {
  it('should render without crashing', () => {
    expect(() => {
      render(<PostsList posts={[]} />);
    }).not.toThrow();
  });

  it('should display "No posts found" when posts array is empty', () => {
    render(<PostsList posts={[]} />);
    
    expect(screen.getByText('No posts found.')).toBeInTheDocument();
  });

  it('should render posts when provided', () => {
    render(<PostsList posts={mockPosts} />);
    
    // Check that posts are rendered
    expect(screen.getByText('Complete Guide to React Hooks')).toBeInTheDocument();
    expect(screen.getByText('Next.js Best Practices for 2024')).toBeInTheDocument();
    expect(screen.getByText('Advanced TypeScript Patterns')).toBeInTheDocument();
  });

  it('should render post excerpts', () => {
    render(<PostsList posts={mockPosts} />);
    
    expect(screen.getByText('Learn everything about React hooks in this comprehensive guide.')).toBeInTheDocument();
    expect(screen.getByText('Modern Next.js development practices you should know.')).toBeInTheDocument();
  });

  it('should render post authors', () => {
    render(<PostsList posts={mockPosts} />);
    
    // Author appears with "By " prefix
    const authorElements = screen.getAllByText(/By John Doe/);
    expect(authorElements.length).toBe(mockPosts.length);
  });

  it('should render post tags', () => {
    render(<PostsList posts={mockPosts} />);
    
    // Tags appear with "#" prefix (use getAllByText for duplicates)
    expect(screen.getByText('#React')).toBeInTheDocument();
    expect(screen.getAllByText('#TypeScript')).toHaveLength(2); // Appears in 2 posts
    expect(screen.getByText('#Next.js')).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(<PostsList posts={mockPosts} />);
    
    expect(container.querySelector('.posts-grid')).toBeInTheDocument();
    expect(container.querySelectorAll('.post-card')).toHaveLength(mockPosts.length);
  });

  it('should handle posts with missing optional fields', () => {
    const postsWithMissingFields = [{
      ...mockPosts[0],
      image: undefined, // Remove optional image field
    }];
    
    expect(() => {
      render(<PostsList posts={postsWithMissingFields} />);
    }).not.toThrow();
  });
});