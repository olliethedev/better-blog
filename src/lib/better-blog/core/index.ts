
import type { ServerBlogConfig, Post } from './types';
import { matchRoute, generateStaticRoutes } from './router';

export class BetterBlogCore {
  constructor(private config: ServerBlogConfig) {}

  // Core business logic methods
  async getPosts(filter?: { slug?: string; tag?: string }): Promise<Post[]> {
    return this.config.getAllPosts(filter);
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    if (this.config.getPostBySlug) {
      return this.config.getPostBySlug(slug);
    }
    
    // Fallback: filter all posts by slug
    const posts = await this.config.getAllPosts({ slug });
    return posts.find(post => post.slug === slug) || null;
  }

  // async getPostsByTag(tag: string): Promise<Post[]> {
  //   if (this.config.getPostsByTag) {
  //     return this.config.getPostsByTag(tag);
  //   }
    
  //   // Fallback: filter all posts by tag
  //   const posts = await this.config.getAllPosts({ tag });
  //   return posts.filter(post => 
  //     post.tags.some(postTag => postTag.slug === tag)
  //   );
  // }

  // Router methods
  
  matchRoute(slug?: string[]) {
    return matchRoute(slug);
  }

  getStaticRoutes() {
    return generateStaticRoutes();
  }
}

