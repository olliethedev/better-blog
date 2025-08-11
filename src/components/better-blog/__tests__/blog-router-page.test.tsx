import { render, screen } from '@testing-library/react';
import { BlogRouterPage } from '../blog-router-page';
import { BetterBlogContextProvider } from '@/lib/better-blog/context/better-blog-context';
import type { PageComponentOverrides } from '@/lib/better-blog/core/client-components';

function renderWithProvider({
  path,
  overrides,
  basePath = '/posts',
}: {
  path?: string;
  overrides?: PageComponentOverrides;
  basePath?: string;
}) {
  const clientConfig = {
    getAllPosts: async () => [],
    getPostBySlug: async () => null,
  };

  return render(
    <BetterBlogContextProvider
      clientConfig={clientConfig}
      pageOverrides={overrides}
      basePath={basePath}
    >
      <BlogRouterPage path={path} />
    </BetterBlogContextProvider>
  );
}

const Home = () => <div data-testid="home">Home Mock</div>;
const Post = () => <div data-testid="post">Post Mock</div>;
const Tag = () => <div data-testid="tag">Tag Mock</div>;
const Drafts = () => <div data-testid="drafts">Drafts Mock</div>;
const NewPost = () => <div data-testid="new">New Mock</div>;
const EditPost = () => <div data-testid="edit">Edit Mock</div>;

const overrides: PageComponentOverrides = {
  HomeComponent: Home,
  PostComponent: Post,
  TagComponent: Tag,
  DraftsComponent: Drafts,
  NewPostComponent: NewPost,
  EditPostComponent: EditPost,
};

describe('BlogRouterPage rendering with overrides', () => {
  test('renders Home for root path (uses basePath context)', () => {
    renderWithProvider({ path: '/posts', overrides });
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  test('renders Post for dynamic slug', () => {
    renderWithProvider({ path: '/posts/hello-world', overrides });
    expect(screen.getByTestId('post')).toBeInTheDocument();
  });

  test('renders Tag for /tag/:tag', () => {
    renderWithProvider({ path: '/posts/tag/react', overrides });
    expect(screen.getByTestId('tag')).toBeInTheDocument();
  });

  test('renders Drafts for /drafts', () => {
    renderWithProvider({ path: '/posts/drafts', overrides });
    expect(screen.getByTestId('drafts')).toBeInTheDocument();
  });

  test('renders New for /new', () => {
    renderWithProvider({ path: '/posts/new', overrides });
    expect(screen.getByTestId('new')).toBeInTheDocument();
  });

  test('renders Edit for /:slug/edit', () => {
    renderWithProvider({ path: '/posts/my-post/edit', overrides });
    expect(screen.getByTestId('edit')).toBeInTheDocument();
  });
});

describe('BlogRouterPage NotFound behavior', () => {
  test('renders default NotFound with unknown route message when no override', () => {
    renderWithProvider({ path: '/posts/does-not-exist/deep' });
    // Default NotFound renders a heading and the routeMatch.metadata.title as message
    expect(screen.getByText('Not Found')).toBeInTheDocument();
    expect(screen.getByText(/Unknown route: \/does-not-exist\/deep/)).toBeInTheDocument();
  });

  test('uses NotFoundComponent override and passes message', () => {
    const NotFoundComponent = ({ message }: { message: string }) => (
      <div data-testid="not-found">Custom Not Found: {message}</div>
    );

    renderWithProvider({
      path: '/posts/does-not-exist/deep',
      overrides: { NotFoundComponent },
    });

    const el = screen.getByTestId('not-found');
    expect(el).toBeInTheDocument();
    expect(el.textContent).toContain('Unknown route: /does-not-exist/deep');
  });

  test('basePath normalization works for "posts" (no slashes)', () => {
    renderWithProvider({ path: '/posts/new', overrides, basePath: 'posts' });
    expect(screen.getByTestId('new')).toBeInTheDocument();
  });

  test('basePath normalization works for "/posts/" (leading and trailing slash)', () => {
    renderWithProvider({ path: '/posts/new', overrides, basePath: '/posts/' });
    expect(screen.getByTestId('new')).toBeInTheDocument();
  });
});


