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

export interface BlogDataProvider {
  getAllPosts: (filter?: { slug?: string; tag?: string }) => Promise<Post[]>;
  getPostBySlug?: (slug: string) => Promise<Post | null>;
}

// Combined configuration
export interface BetterBlogConfig {
  server: BlogDataProvider;
  client: BlogDataProvider;
}

// Legacy config for backwards compatibility (will be removed)
export interface LegacyBlogConfig {
  getAllPosts: (filter?: { slug?: string; tag?: string }) => Promise<Post[]>;
  getPostBySlug?: (slug: string) => Promise<Post | null>;
}

export interface RouteMatch {
  type: 'home' | 'post' | 'unknown';
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