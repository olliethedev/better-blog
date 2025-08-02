import type { Post, Author, Tag, BetterBlogConfig } from '@/lib/better-blog/core/types';

// Mock data
export const mockAuthor: Author = {
  id: 'author-1',
  name: 'John Doe',
  image: 'https://example.com/author.jpg'
};

export const mockTags: Tag[] = [
  { id: 'tag-1', slug: 'react', name: 'React' },
  { id: 'tag-2', slug: 'typescript', name: 'TypeScript' },
  { id: 'tag-3', slug: 'nextjs', name: 'Next.js' }
];

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    slug: 'react-hooks-guide',
    title: 'Complete Guide to React Hooks',
    content: '<p>This is a comprehensive guide to React hooks...</p>',
    excerpt: 'Learn everything about React hooks in this comprehensive guide.',
    image: 'https://example.com/react-hooks.jpg',
    published: true,
    tags: [mockTags[0], mockTags[1]], // react, typescript
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    author: mockAuthor
  },
  {
    id: 'post-2',
    slug: 'nextjs-best-practices',
    title: 'Next.js Best Practices for 2024',
    content: '<p>Discover the latest Next.js best practices...</p>',
    excerpt: 'Modern Next.js development practices you should know.',
    image: 'https://example.com/nextjs.jpg',
    published: true,
    tags: [mockTags[2]], // nextjs
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-04'),
    author: mockAuthor
  },
  {
    id: 'post-3',
    slug: 'typescript-advanced',
    title: 'Advanced TypeScript Patterns',
    content: '<p>Explore advanced TypeScript patterns...</p>',
    excerpt: 'Advanced patterns and techniques in TypeScript.',
    published: false, // unpublished post
    tags: [mockTags[1]], // typescript
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-06'),
    author: mockAuthor
  }
];

// Mock config factory
export const createMockConfig = (overrides?: Partial<BetterBlogConfig>): BetterBlogConfig => ({
  getAllPosts: jest.fn(async (filter) => {
    let posts = [...mockPosts];
    
    if (filter?.slug) {
      posts = posts.filter(post => post.slug === filter.slug);
    }
    
    if (filter?.tag) {
      posts = posts.filter(post => 
        post.tags.some(tag => tag.slug === filter.tag)
      );
    }
    
    return posts;
  }),
  getPostBySlug: jest.fn(async (slug) => {
    return mockPosts.find(post => post.slug === slug) || null;
  }),
  getPostsByTag: jest.fn(async (tag) => {
    return mockPosts.filter(post => 
      post.tags.some(postTag => postTag.slug === tag)
    );
  }),
  ...overrides
});

export const createMockConfigWithoutOptionalMethods = (): BetterBlogConfig => ({
  getAllPosts: jest.fn(async (filter) => {
    let posts = [...mockPosts];
    
    if (filter?.slug) {
      posts = posts.filter(post => post.slug === filter.slug);
    }
    
    if (filter?.tag) {
      posts = posts.filter(post => 
        post.tags.some(tag => tag.slug === filter.tag)
      );
    }
    
    return posts;
  })
  // No getPostBySlug or getPostsByTag methods
});