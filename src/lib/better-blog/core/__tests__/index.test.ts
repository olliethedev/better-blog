import { BetterBlogCore } from '@/lib/better-blog/core';
import { 
  createMockConfig, 
  createMockConfigWithoutOptionalMethods, 
  mockPosts 
} from '@/test/mocks/data';
import type { BetterBlogConfig } from '@/lib/better-blog/core/types';

describe('BetterBlogCore', () => {
  let mockConfig: BetterBlogConfig;
  let core: BetterBlogCore;

  beforeEach(() => {
    mockConfig = createMockConfig();
    core = new BetterBlogCore(mockConfig);
  });

  describe('constructor', () => {
    it('should create instance with config', () => {
      expect(core).toBeInstanceOf(BetterBlogCore);
    });
  });

  describe('getPosts', () => {
    it('should call config.getAllPosts without filter', async () => {
      const result = await core.getPosts();
      
      expect(mockConfig.getAllPosts).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockPosts);
    });

    it('should call config.getAllPosts with slug filter', async () => {
      const filter = { slug: 'react-hooks-guide' };
      const result = await core.getPosts(filter);
      
      expect(mockConfig.getAllPosts).toHaveBeenCalledWith(filter);
      expect(result).toEqual([mockPosts[0]]);
    });

    it('should call config.getAllPosts with tag filter', async () => {
      const filter = { tag: 'react' };
      const result = await core.getPosts(filter);
      
      expect(mockConfig.getAllPosts).toHaveBeenCalledWith(filter);
      expect(result).toEqual([mockPosts[0]]);
    });

    it('should call config.getAllPosts with both filters', async () => {
      const filter = { slug: 'react-hooks-guide', tag: 'react' };
      await core.getPosts(filter);
      
      expect(mockConfig.getAllPosts).toHaveBeenCalledWith(filter);
    });
  });

  describe('getPostBySlug', () => {
    it('should use config.getPostBySlug when available', async () => {
      const result = await core.getPostBySlug('react-hooks-guide');
      
      expect(mockConfig.getPostBySlug).toHaveBeenCalledWith('react-hooks-guide');
      expect(result).toEqual(mockPosts[0]);
    });

    it('should return null when post not found', async () => {
      const result = await core.getPostBySlug('non-existent');
      
      expect(mockConfig.getPostBySlug).toHaveBeenCalledWith('non-existent');
      expect(result).toBeNull();
    });

    it('should fallback to getAllPosts when getPostBySlug not provided', async () => {
      const configWithoutMethod = createMockConfigWithoutOptionalMethods();
      const coreWithoutMethod = new BetterBlogCore(configWithoutMethod);
      
      const result = await coreWithoutMethod.getPostBySlug('react-hooks-guide');
      
      expect(configWithoutMethod.getAllPosts).toHaveBeenCalledWith({ slug: 'react-hooks-guide' });
      expect(result).toEqual(mockPosts[0]);
    });

    it('should return null in fallback when post not found', async () => {
      const configWithoutMethod = createMockConfigWithoutOptionalMethods();
      const coreWithoutMethod = new BetterBlogCore(configWithoutMethod);
      
      const result = await coreWithoutMethod.getPostBySlug('non-existent');
      
      expect(configWithoutMethod.getAllPosts).toHaveBeenCalledWith({ slug: 'non-existent' });
      expect(result).toBeNull();
    });
  });

  describe('getPostsByTag', () => {
    it('should use config.getPostsByTag when available', async () => {
      const result = await core.getPostsByTag('react');
      
      expect(mockConfig.getPostsByTag).toHaveBeenCalledWith('react');
      expect(result).toEqual([mockPosts[0]]);
    });

    it('should return empty array when no posts found', async () => {
      const result = await core.getPostsByTag('non-existent-tag');
      
      expect(mockConfig.getPostsByTag).toHaveBeenCalledWith('non-existent-tag');
      expect(result).toEqual([]);
    });

    it('should fallback to getAllPosts when getPostsByTag not provided', async () => {
      const configWithoutMethod = createMockConfigWithoutOptionalMethods();
      const coreWithoutMethod = new BetterBlogCore(configWithoutMethod);
      
      const result = await coreWithoutMethod.getPostsByTag('react');
      
      expect(configWithoutMethod.getAllPosts).toHaveBeenCalledWith({ tag: 'react' });
      expect(result).toEqual([mockPosts[0]]);
    });

    it('should filter posts by tag in fallback mode', async () => {
      const configWithoutMethod = createMockConfigWithoutOptionalMethods();
      const coreWithoutMethod = new BetterBlogCore(configWithoutMethod);
      
      const result = await coreWithoutMethod.getPostsByTag('typescript');
      
      expect(result).toEqual([mockPosts[0], mockPosts[2]]); // Both have typescript tag
    });

    it('should return empty array in fallback when no posts with tag found', async () => {
      const configWithoutMethod = createMockConfigWithoutOptionalMethods();
      const coreWithoutMethod = new BetterBlogCore(configWithoutMethod);
      
      const result = await coreWithoutMethod.getPostsByTag('non-existent-tag');
      
      expect(result).toEqual([]);
    });
  });

  describe('router methods', () => {
    it('should delegate matchRoute to router function', () => {
      const result = core.matchRoute(['react-hooks-guide']);
      
      expect(result).toEqual({
        type: 'post',
        data: { slug: 'react-hooks-guide' },
        metadata: {
          title: 'Post: react-hooks-guide'
        }
      });
    });

    it('should delegate getStaticRoutes to router function', () => {
      const result = core.getStaticRoutes();
      
      expect(result).toEqual([
        { slug: [] },
        { slug: ['new'] },
        { slug: ['drafts'] }
      ]);
    });
  });
});