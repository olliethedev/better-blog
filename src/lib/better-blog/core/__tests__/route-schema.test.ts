import { matchPattern, resolveMetadata } from '../route-schema';
import { routeSchema } from '../routes';

describe('matchPattern', () => {
  test('matches static and dynamic segments and extracts params', () => {
    const result = matchPattern(['tag', 'react'], ['tag', ':tag']);
    expect(result.matches).toBe(true);
    expect(result.params).toEqual({ tag: 'react' });
  });

  test('returns false when lengths differ', () => {
    const result = matchPattern(['a'], ['a', 'b']);
    expect(result.matches).toBe(false);
    expect(result.params).toEqual({});
  });

  test('returns false when a static segment does not match', () => {
    const result = matchPattern(['tags', 'react'], ['tag', ':tag']);
    expect(result.matches).toBe(false);
    expect(result.params).toEqual({});
  });

  test('extracts multiple dynamic params', () => {
    const result = matchPattern(['hello', 'edit'], [':slug', 'edit']);
    expect(result.matches).toBe(true);
    expect(result.params).toEqual({ slug: 'hello' });
  });
});

describe('resolveMetadata', () => {
  test('resolves static metadata for home route', () => {
    const home = routeSchema.routes.find((r) => r.type === 'home');
    expect(home).toBeDefined();
    const meta = resolveMetadata(home!, {});
    expect(meta.title).toBe('Blog Posts');
    expect(meta.description).toBe('Latest blog posts');
  });

  test('resolves dynamic metadata for post route', () => {
    const post = routeSchema.routes.find((r) => r.type === 'post');
    expect(post).toBeDefined();
    const meta = resolveMetadata(post!, { slug: 'hello-world' });
    expect(meta.title).toBe('Post: hello-world');
    expect(meta.description).toBe('Blog post content');
  });

  test('resolves dynamic metadata for tag route', () => {
    const tag = routeSchema.routes.find((r) => r.type === 'tag');
    expect(tag).toBeDefined();
    const meta = resolveMetadata(tag!, { tag: 'react' });
    expect(meta.title).toBe('Posts tagged: react');
    expect(meta.description).toBe('All posts tagged with react');
  });
});


