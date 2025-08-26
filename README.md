# better-blog

Add a production-ready, SEO-friendly blog to your React app in minutes. better-blog is a framework-agnostic, type-safe router + component set with drop-in setup, SSR/SSG out of the box, and full customization—works with modern frameworks like Next.js App Router and React Router.

---

⚠️ This repository is a WORK IN PROGRESS and is under active development.
Do not use it in production until it is stable 1.0.0

---

Read the docs at [better-blog.com](https://www.better-blog.com).

### Highlights

- **Drop-in blog in minutes**: One provider + one catch-all route
- **Fully customizable UI**: Override any page or loading component; keep your design system
- **Bring your own content source**: Pluggable `BlogDataProvider` for CMS/API/files/DB
- **Works anywhere**: Next.js App Router or React Router with the same core
- **TypeScript-first DX**: Strong types across routes, hooks, and providers
- **SEO-first by default**: SSR/SSG support, route-aware metadata helpers, hydration-safe rendering


---

## Installation

```bash
pnpm add better-blog @tanstack/react-query
```

### Tailwind CSS

Configure Tailwind to include better-blog's classes:

- Tailwind v4 (in your `globals.css`):

```css
/* globals.css */
@source "../node_modules/better-blog";
```

- Tailwind v3 (in your `tailwind.config.{js,ts}`):

```ts
// tailwind.config.ts
export default {
  content: [
    // your app paths...
    "./node_modules/better-blog/dist/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // ...rest of config
};
```

## Core concepts

- **Package structure**
  - `better-blog`: shared utilities and types
  - `better-blog/client`: client components (`BlogRouterPage`, `BetterBlogContextProvider`, hooks)
  - `better-blog/server`: server adapters (e.g. `createServerAdapter` for SSR/SSG)

- **Data provider**
  - You inject a `BlogDataProvider` implementation (CMS, files, API, DB):
    ```ts
    export interface BlogDataProvider {
      getAllPosts: (filter?: { slug?: string; tag?: string; offset?: number; limit?: number }) => Promise<Post[]>;
      getPostBySlug?: (slug: string) => Promise<Post | null>;
      ...
    }
    ```


---

## Next.js App Router (SSR/SSG) example

This renders all blog routes under `/posts/...` with server prefetch + client hydration. Provide separate data providers for server and client.

1) `app/posts/[[...all]]/page.tsx` (server)

```tsx
import { createServerAdapter } from 'better-blog/server';
import type { BlogDataProvider, Post } from 'better-blog';
import type { Metadata } from 'next';
import { getQueryClient } from '@/lib/get-query-client';

const serverBlogConfig: BlogDataProvider = {
  async getAllPosts(filter) {...},
  async getPostBySlug(slug) {...},
  ...
};

const queryClient = getQueryClient();
const adapter = createServerAdapter(serverBlogConfig, queryClient);

export const generateStaticParams = adapter.generateStaticParams;
export const generateMetadata: (ctx: { params: Promise<{ all: string[] }> }) => Promise<Metadata> = adapter.generateMetadata as any;

export default function Page({ params }: { params: { all?: string[] } }) {
  return (
    <adapter.Entry
      params={Promise.resolve({ all: params.all ?? [] })}
      queryClient={queryClient}
    />
  );
}
```

2) `app/posts/layout.tsx` (server)

```tsx
import type { ReactNode } from 'react';
import { Provider } from '@/components/providers';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <header><nav><a href="/posts">All Posts</a></nav></header>
      <main>{children}</main>
      <footer />
    </Provider>
  );
}
```

3) `components/providers.tsx` (client)

```tsx
'use client';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { BetterBlogContextProvider } from 'better-blog/client';
import type { ComponentsContextValue, BlogDataProvider, Post } from 'better-blog';
import { getQueryClient } from '@/lib/get-query-client';

const components: ComponentsContextValue = {
  Link: ({ href, children, className }) => (<Link href={href} className={className}>{children}</Link>),
  Image: ({ src, alt, className, width, height }) => (
    <Image src={src} alt={alt} className={className} width={width ?? 800} height={height ?? 400} />
  ),
};

// Client provider
const clientBlogConfig: BlogDataProvider = {
  async getAllPosts(filter) {...},
  async getPostBySlug(slug) {...},
  ...
};

export function Provider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BetterBlogContextProvider clientConfig={clientBlogConfig} components={components}>
        {children}
      </BetterBlogContextProvider>
    </QueryClientProvider>
  );
}
```

That’s it: your pages are rendered with prefetched data and hydrated on the client. Override UI or add loading states via the provider (see below).

---

## API routes

If you prefer not to ship a client-side `BlogDataProvider`, better-blog can expose API endpoints and consume them via a default API-backed provider.

### 1) Mount the API router (Next.js)

Create `app/api/posts/[...all]/route.ts`:

```ts
import { createBlogApiRouter } from 'better-blog/server/api';
import type { BlogDataProvider } from 'better-blog';

// Your server-side provider (DB/CMS/etc.) implementing reads and optional mutations
const serverProvider: BlogDataProvider = {
  async getAllPosts(filter) { /* ... */ return [] },
  async getPostBySlug(slug) { /* ... */ return null },
  async createPost(input) { /* ... */ return {} as any },
  async updatePost(slug, input) { /* ... */ return {} as any },
  async deletePost(slug) { /* ... */ }
}

const { handler } = createBlogApiRouter(serverProvider, {
  basePath: '/api/posts' // must match your route path
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
```

Endpoints exposed:
- `GET /api/posts/posts` – list (supports `slug`, `tag`, `offset`, `limit`, `query`)
- `GET /api/posts/posts/:slug` – fetch one
- `POST /api/posts/posts` – create
- `PUT /api/posts/posts/:slug` – update
- `DELETE /api/posts/posts/:slug` – delete

All inputs are validated with zod schemas from `src/lib/better-blog/schema/post.ts`.

### 2) Use the default API-backed provider (client)

Omit `clientConfig` to let the provider default to calling the API, or set a custom base path.

```tsx
import { BetterBlogContextProvider } from 'better-blog/client';

<BetterBlogContextProvider
  // clientConfig is optional – defaults to API-backed provider
  apiBasePath="/api/posts" // must match router basePath
>
  {children}
</BetterBlogContextProvider>
```



---

## React DOM Router (CSR) example

This renders all blog routes under `/blog/*` using client-side data fetching.

1) `main.tsx`

```tsx
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from './providers';
import BlogEntryPage from './BlogEntryPage';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Provider>
      <Routes>
        <Route path="/blog/*" element={<BlogEntryPage />} />
      </Routes>
    </Provider>
  </BrowserRouter>
);
```

2) `BlogEntryPage.tsx`

```tsx
import { useLocation } from 'react-router-dom';
import { BlogRouterPage } from 'better-blog/client';

export default function BlogEntryPage() {
  const pathname = useLocation().pathname.replace('/blog', '') || '/';
  const slug = pathname.split('/').filter(Boolean);
  return <BlogRouterPage slug={slug} />;
}
```

3) `providers.tsx`

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import { BetterBlogContextProvider } from 'better-blog/client';

const components = {
  Link: ({ href, children, className }) => (
    <NavLink to={href.replace('/posts', '/blog')} className={className}>
      {children}
    </NavLink>
  ),
  Image: (p) => <img {...p} />,
};

const clientBlogConfig = {
  async getAllPosts() { return []; },
  async getPostBySlug() { return null; },
};

const queryClient = new QueryClient();

export function Provider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BetterBlogContextProvider clientConfig={clientBlogConfig} components={components}>
        {children}
      </BetterBlogContextProvider>
    </QueryClientProvider>
  );
}
```

---

## TanStack Query (React Query) setup

Why we use it:

- **Caching + de/rehydration**: Server prefetch + client hydration for SEO and zero-flash data.
- **Great DX**: Automatic refetching, pagination support, and easy overrides.

Add a small helper to create/reuse a `QueryClient` in both server and browser environments.

Create `lib/get-query-client.ts`:

```ts
import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // Include pending queries in dehydration (useful for Suspense)
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: reuse a single instance to avoid remounts across Suspense
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
```

Use `getQueryClient()` in the Next.js and React Router examples above.

---

## Overriding page components

Use `pageOverrides` to replace any built-in page or loading component, and `components` to wire your router-specific `Link`/`Image`.

```tsx
import { BetterBlogContextProvider } from 'better-blog/client';

function MyHome() { return <div>Custom Home</div>; }
function MyHomeLoading() { return <div>Loading home…</div>; }

<BetterBlogContextProvider
  clientConfig={clientConfig}
  components={{ Link: MyLink, Image: MyImage }}
  pageOverrides={{ HomeComponent: MyHome, HomeLoadingComponent: MyHomeLoading }}
>
  {children}
</BetterBlogContextProvider>
```

---

## API surface (most used)

- **Server utilities** (`better-blog`)
  - `matchRoute(slug?: string[]): RouteMatch`
  - `generateStaticRoutes(): Array<{ slug: string[] }>`
  - `generatePostMetadata(post: Post): { title: string; description?: string; image?: string }`

- **Server adapter** (`better-blog/server`)
  - `createServerAdapter(serverConfig: BlogDataProvider, queryClient: QueryClient)` → `{ generateStaticParams, generateMetadata, Entry }`

- **Client** (`better-blog/client`)
  - `BetterBlogContextProvider`, `BlogRouterPage`
  - Hooks: `usePosts`, `usePost`, `useTagPosts`, `useDrafts`, `useCreatePost`, `useUpdatePost`, `useDeletePost`

---

## Architecture (for contributors)

- **Design**
  - Schema-driven routes and data; minimal state in components
  - Strict client/server separation via dedicated entry points

- **Key modules**
  - `core/router.ts`: `matchRoute`, `generateStaticRoutes`
  - `core/routes.tsx`: route schema (patterns, metadata, data handlers)
  - `core/route-schema.ts`: pattern matching + metadata resolution
  - `core/client-components.ts`: maps route types to client components; override helpers
  - `components/better-blog/*`: default UI and route components
  - `server/index.tsx`: Next.js-oriented server adapter (prefetch + hydrate)

- **Folder map**
  ```
  src/
  ├─ index.ts           # server-safe exports
  ├─ client.ts          # client-only exports
  ├─ server.ts          # server adapters
  └─ lib/better-blog/
     ├─ core/           # framework-agnostic logic
     ├─ context/        # React contexts
     ├─ hooks/          # data hooks (React Query)
     └─ server/         # SSR utilities
  ```

---

## Developing the library

### Prereqs

```bash
pnpm install
```

Optional: for local linking use [yalc](https://github.com/wclr/yalc).

### Common commands

- `pnpm dev` – watch build and auto-publish via yalc to linked local apps
- `pnpm build` – production build (ESM + CJS + types)
- `pnpm test` – run unit tests

### Testing locally in an app

```bash
yalc publish --push
# in your app
yalc add better-blog && pnpm install
```

---

## License

MIT

---

## Roadmap (short)
- kysely DB data providers (Postgres, MySQL, SQLite)
- aditional data provider adapters (Prisma, Drizzle, MongoDB)
- finalize page designs
- blog translations
- blog post versioning
- richer metadata helpers (og:image, canonical url, etc.)
- tanstack start docs
- remix docs
- example projects