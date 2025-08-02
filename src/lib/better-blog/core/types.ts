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
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
  author: Author;
};

export interface BetterBlogConfig {
  getAllPosts: (filter?: { slug?: string; tag?: string }) => Promise<Post[]>;
  getPostBySlug?: (slug: string) => Promise<Post | null>;
  getPostsByTag?: (tag: string) => Promise<Post[]>;
}

export type RouteParams = {
  slug?: string[];
  [key: string]: any;
};

export interface RouteMatch {
  type: 'home' | 'post' | 'tag' | 'new' | 'drafts' | 'edit' | 'unknown';
  data?: {
    slug?: string;
    tag?: string;
    postSlug?: string;
  };
  metadata: {
    title: string;
    description?: string;
  };
}