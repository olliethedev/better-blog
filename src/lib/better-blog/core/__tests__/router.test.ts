import { matchRoute, generateStaticRoutes } from '@/lib/better-blog/core/router';

describe('Router Functions', () => {
  describe('matchRoute', () => {
    it('should return home route for undefined slug', () => {
      const result = matchRoute();
      
      expect(result).toEqual({
        type: 'home',
        metadata: {
          title: 'Blog Posts',
          description: 'Latest blog posts'
        }
      });
    });

    it('should return home route for empty slug array', () => {
      const result = matchRoute([]);
      
      expect(result).toEqual({
        type: 'home',
        metadata: {
          title: 'Blog Posts',
          description: 'Latest blog posts'
        }
      });
    });

    describe('single segment routes', () => {
      it('should return new post route', () => {
        const result = matchRoute(['new']);
        
        expect(result).toEqual({
          type: 'new',
          metadata: {
            title: 'Create New Post'
          }
        });
      });

      it('should return drafts route', () => {
        const result = matchRoute(['drafts']);
        
        expect(result).toEqual({
          type: 'drafts',
          metadata: {
            title: 'My Drafts'
          }
        });
      });

      it('should return post route for post slug', () => {
        const result = matchRoute(['my-awesome-post']);
        
        expect(result).toEqual({
          type: 'post',
          data: { slug: 'my-awesome-post' },
          metadata: {
            title: 'Post: my-awesome-post'
          }
        });
      });
    });

    describe('two segment routes', () => {
      it('should return tag route', () => {
        const result = matchRoute(['tag', 'react']);
        
        expect(result).toEqual({
          type: 'tag',
          data: { tag: 'react' },
          metadata: {
            title: 'Posts tagged: react'
          }
        });
      });

      it('should return edit route', () => {
        const result = matchRoute(['my-post-slug', 'edit']);
        
        expect(result).toEqual({
          type: 'edit',
          data: { postSlug: 'my-post-slug' },
          metadata: {
            title: 'Editing: my-post-slug'
          }
        });
      });

      it('should return unknown route for unrecognized pattern', () => {
        const result = matchRoute(['something', 'else']);
        
        expect(result).toEqual({
          type: 'unknown',
          metadata: {
            title: 'Unknown route: /posts/something/else'
          }
        });
      });
    });

    describe('three or more segments', () => {
      it('should return unknown route', () => {
        const result = matchRoute(['one', 'two', 'three']);
        
        expect(result).toEqual({
          type: 'unknown',
          metadata: {
            title: 'Unknown route: /posts/one/two/three'
          }
        });
      });
    });
  });

  describe('generateStaticRoutes', () => {
    it('should return static routes array', () => {
      const result = generateStaticRoutes();
      
      expect(result).toEqual([
        { slug: [] },
        { slug: ['new'] },
        { slug: ['drafts'] }
      ]);
    });

    it('should return a new array each time', () => {
      const result1 = generateStaticRoutes();
      const result2 = generateStaticRoutes();
      
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });
});