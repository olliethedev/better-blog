import type { BlogPostMetadata, Post } from "./types"

// Utility function to generate metadata from post data
export function generatePostMetadata(post: Post): BlogPostMetadata {
    return {
        title: post.title,
        description: post.excerpt,
        image: post.image
    }
}