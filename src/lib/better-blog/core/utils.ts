import type { Post, BlogMetadata } from './types';

// Utility function to generate metadata from post data
export function generatePostMetadata(post: Post): BlogMetadata {
  return {
    title: post.title,
    description: post.excerpt,
    image: post.image,
  };
}