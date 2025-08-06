// Server-safe route definitions (no React component imports)
import type { BlogDataProvider } from './types';
import type { RouteDefinition, RouteSchema } from './route-schema';

const routes: RouteDefinition[] = [
  {
    type: 'home',
    pattern: [],
    staticRoutes: [{ slug: [] }],
    metadata: {
      title: 'Blog Posts',
      description: 'Latest blog posts'
    },

    data: {
      queryKey: () => ['posts', {}],
      server: async (params, provider) => {
        return await provider.getAllPosts({ offset: 0, limit: 10 });
      },
      isInfinite: true
    }
  },

  {
    type: 'post',
    pattern: [':slug'],
    metadata: {
      title: (params) => `Post: ${params.slug}`,
      description: 'Blog post content'
    },

    data: {
      queryKey: (params) => ['post', params.slug],
      server: async (params, provider) => {
        const slug = params.slug;
        if (!slug) return null;
        
        // Try getPostBySlug first, fallback to getAllPosts filter
        const post = await provider.getPostBySlug?.(slug);
        if (post) return post;
        
        const posts = await provider.getAllPosts({ slug });
        return posts.find(p => p.slug === slug) || null;
      }
    }
  },

  {
    type: 'tag',
    pattern: ['tag', ':tag'],
    metadata: {
      title: (params) => `Posts tagged: ${params.tag}`,
      description: (params) => `All posts tagged with ${params.tag}`
    },

    data: {
      queryKey: (params) => ['posts', { tag: params.tag }],
      server: async (params, provider) => {
        return await provider.getAllPosts({ tag: params.tag, offset: 0, limit: 10 });
      },
      isInfinite: true
    }
  },

  {
    type: 'drafts',
    pattern: ['drafts'],
    staticRoutes: [{ slug: ['drafts'] }],
    metadata: {
      title: 'My Drafts',
      description: 'Draft posts'
    },

    data: {
      queryKey: () => ['drafts'],
      server: async (params, provider) => {
        const posts = await provider.getAllPosts({ offset: 0, limit: 10 });
        return posts.filter(post => !post.published);
      },
      isInfinite: true
    }
  },

  {
    type: 'new',
    pattern: ['new'],
    staticRoutes: [{ slug: ['new'] }],
    metadata: {
      title: 'Create New Post',
      description: 'Create a new blog post'
    },

    // No data handler needed for new post page
  },

  {
    type: 'edit',
    pattern: [':slug', 'edit'],
    metadata: {
      title: (params) => `Editing: ${params.slug}`,
      description: 'Edit blog post'
    },

    data: {
      queryKey: (params) => ['post', params.slug],
      server: async (params, provider) => {
        const slug = params.slug;
        if (!slug) return null;
        
        // Try getPostBySlug first, fallback to getAllPosts filter
        const post = await provider.getPostBySlug?.(slug);
        if (post) return post;
        
        const posts = await provider.getAllPosts({ slug });
        return posts.find(p => p.slug === slug) || null;
      }
    }
  }
];

export const routeSchema: RouteSchema = {
  routes
};