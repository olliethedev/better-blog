export type Tag = {
  id: string;
  slug: string;
  name: string;
};

export type Author = {
  id: string;
  name: string;
  image?: string;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  image?: string;
  published: boolean;
  publishedAt?: Date;
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
  author: Author;
};

import type {
    PostCreateWithoutRefineInput,
    PostUpdateWithoutRefineInput
} from "../schema/post"

export type PostCreateInput = PostCreateWithoutRefineInput
export type PostUpdateInput = PostUpdateWithoutRefineInput

export interface BlogDataProvider {
    getAllPosts: (filter?: {
        slug?: string
        tag?: string
        offset?: number
        limit?: number
        query?: string
    }) => Promise<Post[]>
    getPostBySlug?: (slug: string) => Promise<Post | null>
    createPost?: (input: PostCreateInput) => Promise<Post>
    updatePost?: (slug: string, input: PostUpdateInput) => Promise<Post>
    deletePost?: (slug: string) => Promise<void>
}

// Combined configuration
export interface BetterBlogConfig {
  server: BlogDataProvider;
  client: BlogDataProvider;
}

export interface RouteMatch {
  type: 'home' | 'post' | 'tag' | 'drafts' | 'new' | 'edit' | 'unknown';
  params?: {
    slug?: string;
    tag?: string;
    postSlug?: string;
  };
  metadata: {
    title: string;
    description?: string;
    image?: string;
  };
}

export interface BlogMetadata {
  title: string;
  description?: string;
  image?: string;
}





export interface ComponentsContextValue {
  Link: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>;
  Image: React.ComponentType<{
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
  }>;
}