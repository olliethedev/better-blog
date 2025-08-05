import type { RouteMatch } from './types';

export function matchRoute(slug?: string[]): RouteMatch {
  // Route pattern matching
  if (!slug || slug.length === 0) {
    return {
      type: 'home',
      metadata: {
        title: 'Blog Posts',
        description: 'Latest blog posts'
      }
    };
  }

  if (slug.length === 1) {
    const [segment] = slug;

    // // Management routes
    // if (segment === 'new') {
    //   return {
    //     type: 'new',
    //     metadata: {
    //       title: 'Create New Post'
    //     }
    //   };
    // }
    
    // if (segment === 'drafts') {
    //   return {
    //     type: 'drafts',
    //     metadata: {
    //       title: 'My Drafts'
    //     }
    //   };
    // }

    // Individual post: /posts/my-blog-post-slug
    return {
      type: 'post',
      params: { slug: segment },
      metadata: {
        title: `Post: ${segment}` // Fallback title, will be replaced by actual post title 
      }
    };
  }

  // if (slug.length === 2) {
  //   const [type, identifier] = slug;

  //   switch (type) {
  //     case 'tag':
  //       // /posts/tag/react
  //       return {
  //         type: 'tag',
  //         data: { tag: identifier },
  //         metadata: {
  //           title: `Posts tagged: ${identifier}`
  //         }
  //       };

  //     default:
  //       // /posts/my-post/edit
  //       if (identifier === 'edit') {
  //         return {
  //           type: 'edit',
  //           data: { postSlug: type },
  //           metadata: {
  //             title: `Editing: ${type}`
  //           }
  //         };
  //       }
  //   }
  // }

  // Fallback
  return {
    type: 'unknown',
    metadata: {
      title: `Unknown route: /posts/${slug.join('/')}`
    }
  };
}

export function generateStaticRoutes(): Array<{ slug: string[] }> {
  return [
    { slug: [] },
    { slug: ['new'] },
    { slug: ['drafts'] }
  ];
}