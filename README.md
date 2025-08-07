# better-blog

A modern, type-safe React blog library designed for Next.js with first-class SSR/SSG support, schema-driven routing, and clean client/server boundaries.

## Architecture Overview

better-blog is architected as a **schema-driven, SSR-first React blog library** with strict client/server boundaries and declarative routing. The system is designed for maximum performance, type safety, and developer experience.

### Core Design Principles

1. **Schema-Driven Routing**: Declarative route definitions with automatic component mapping and data fetching
2. **Explicit Client/Server Boundaries**: Strict separation using "use client" directives and separate entry points
3. **Configuration-Driven Data Access**: Dependency injection pattern for flexible data sources (CMS, API, files)
4. **Framework Agnostic Core**: Business logic independent of React/Next.js implementation details
5. **Performance First**: SSR prefetching with zero hydration mismatches and smart caching
6. **TypeScript Native**: Comprehensive type safety with inference and validation throughout

### Module Architecture

The library is organized into distinct modules with clear boundaries:

```
src/
├── index.ts              # Main entry (server-safe)
├── client.ts             # Client-only exports
├── server.ts             # Server-only exports
└── lib/better-blog/
    ├── core/             # Framework-agnostic business logic
    │   ├── types.ts      # Core type definitions
    │   ├── router.ts     # Route matching engine
    │   ├── routes.tsx    # Route schema definitions
    │   ├── route-schema.ts # Pattern matching utilities
    │   ├── client-components.ts # Client component mappings
    │   ├── component-resolver.ts # Component resolution logic
    │   └── utils.ts      # Shared utilities
    ├── context/          # React context providers
    │   ├── better-blog-context.tsx # Main context
    │   └── route-context.tsx       # Route-specific context
    ├── hooks/            # Client-side data hooks
    └── server/           # Server-side adapters
        ├── index.tsx     # Next.js server adapter
        └── prefetch.ts   # SSR data prefetching
```

### Entry Points & Boundaries

- **`better-blog`** (`src/index.ts`) - Server-safe exports for SSR/SSG components and utilities
- **`better-blog/client`** (`src/client.ts`) - Client-only components, hooks, and context providers
- **`better-blog/server`** (`src/server.ts`) - Server-specific adapters, prefetching, and SSG utilities

This separation ensures:
- Server components never import client-only code
- Client components have access to browser-specific APIs
- Build tools can properly tree-shake unused code paths
- TypeScript can enforce proper usage patterns

### Route System Architecture

#### 1. Schema-Driven Route Definitions

Routes are defined declaratively in `routes.tsx` using a pattern-based schema:

```typescript
interface RouteDefinition {
  type: string;                    // Route identifier
  pattern: (string | ':param')[];  // URL pattern matching
  staticRoutes?: { slug: string[] }[]; // Static routes for SSG
  metadata: { title, description, image }; // SEO metadata
  data?: {                         // Data fetching configuration
    queryKey: (params) => unknown[];      // TanStack Query key
    server: (params, provider) => Promise<T>; // Server data fetcher
    isInfinite?: boolean;          // Pagination support
  };
}
```

#### 2. Pattern Matching Engine

The router uses a sophisticated pattern matching system:

- **Static segments**: `['posts', 'drafts']` matches `/posts/drafts` exactly
- **Dynamic segments**: `[':slug']` captures URL parameters as `{slug: 'value'}`
- **Mixed patterns**: `[':slug', 'edit']` matches `/posts/my-post/edit`

Routes are matched in order of definition with first-match-wins semantics.

#### 3. Component Resolution Pipeline

```
URL → matchRoute() → RouteMatch → resolveComponent() → React Component
```

1. **Route Matching**: URL segments parsed and matched against route patterns
2. **Parameter Extraction**: Dynamic segments extracted into typed parameters object
3. **Component Resolution**: Route type mapped to React component via resolver
4. **Override Support**: Custom components can override defaults via context

### Data Flow Architecture

#### SSR (Server-Side Rendering) Path

```
Request → Server Adapter → Route Match → Prefetch Data → Dehydrate → Client Hydration
```

1. **Server Adapter**: Next.js catches all routes via `[...all]/page.tsx`
2. **Route Resolution**: URL parsed and matched against route schema
3. **Data Prefetching**: Server executes route's data handler with BlogDataProvider
4. **Query Dehydration**: TanStack Query state serialized for client
5. **Component Rendering**: Server renders with prefetched data
6. **Client Hydration**: Client rehydrates from dehydrated state (no loading states)

#### CSR (Client-Side Rendering) Path

```
Navigation → Route Match → Client Query → Loading State → Component Update
```

1. **Client Navigation**: React Router or programmatic navigation
2. **Route Resolution**: Same pattern matching as server
3. **Data Fetching**: Client executes route's data handler via React Query
4. **Loading States**: Custom loading components shown during fetch
5. **Component Update**: Component receives data and re-renders

### Component Architecture

#### 1. Three-Layer Component System

```
├── Route Components (business logic)
│   ├── HomePageComponent
│   ├── PostPageComponent
│   └── TagPageComponent
├── UI Components (presentation)
│   ├── PostCard
│   ├── PostsList
│   └── Badge
└── Base Components (system)
    ├── BlogRouterPage (main router)
    └── Loading (fallback states)
```

#### 2. Component Override System

Components can be overridden at multiple levels:

- **Global Overrides**: Via `BetterBlogContextProvider.pageOverrides`
- **Framework Overrides**: Via `BetterBlogContextProvider.components` (Link, Image)
- **Loading Overrides**: Custom loading states per route type

#### 3. Context Architecture

```typescript
interface BetterBlogContextValue {
  clientConfig: BlogDataProvider;     // Client data access
  components: ComponentsContextValue; // Framework components (Link, Image)
  pageOverrides?: PageComponentOverrides; // Custom page components
}
```

The context provides:
- **Data Provider Injection**: Configurable data access layer
- **Component Abstraction**: Framework-agnostic Link and Image components
- **Override Support**: Custom component injection without code changes

### Data Provider Architecture

#### Dual Provider Pattern

```typescript
interface BetterBlogConfig {
  server: BlogDataProvider; // Server-side data access
  client: BlogDataProvider; // Client-side data access (may differ)
}
```

This enables:
- **Different Implementation**: Server might use direct DB, client uses API
- **Security Boundaries**: Server can access sensitive data, client cannot
- **Performance Optimization**: Different caching strategies per environment

#### Provider Interface

```typescript
interface BlogDataProvider {
  getAllPosts: (filter?: FilterOptions) => Promise<Post[]>;
  getPostBySlug?: (slug: string) => Promise<Post | null>;
}
```

The minimal interface allows integration with:
- **Headless CMS**: Contentful, Strapi, Sanity
- **File Systems**: Markdown, MDX, JSON
- **Databases**: PostgreSQL, MongoDB, SQLite
- **APIs**: REST, GraphQL, tRPC

### Performance Architecture

#### 1. Caching Strategy

- **Server-Side**: Data prefetched and dehydrated into page HTML
- **Client-Side**: TanStack Query with 5-minute stale time, 10-minute GC
- **Static Generation**: Route schema generates static paths automatically

#### 2. Bundle Optimization

- **Code Splitting**: Separate client/server/core bundles
- **Tree Shaking**: ESM modules with side-effect-free exports
- **Peer Dependencies**: Avoids version conflicts and reduces bundle size
- **Directive Preservation**: "use client" boundaries maintained through build

#### 3. Loading State Management

- **SSR**: No loading states (data prefetched)
- **CSR**: Customizable loading components per route type
- **Suspense Integration**: React Suspense boundaries for graceful fallbacks

### Build System Architecture

#### Multi-Format Output

The build system produces:

```
dist/
├── index.js/cjs          # Main entry (server-safe)
├── client.js/cjs         # Client components
├── server.js/cjs         # Server adapters
└── *.d.ts               # TypeScript definitions
```

#### Key Build Features

- **tsup Configuration**: Optimized for library distribution
- **Directive Preservation**: Maintains React "use client" directives
- **External Dependencies**: All React ecosystem deps marked external
- **Dual Format**: ESM and CommonJS for maximum compatibility
- **Development Mode**: Watch mode with automatic yalc publishing

This architecture enables better-blog to provide a cohesive, performant blogging solution while maintaining flexibility for diverse use cases and hosting environments.

## Development Workflow

### Prerequisites

Install [yalc](https://github.com/wclr/yalc) globally for better local package linking:

```bash
npm install -g yalc
```

### Setting Up Local Development

1. **Clone and setup the library**:
```bash
git clone <repo-url>
cd better-blog
pnpm install
pnpm build
yalc publish --push
```

2. **Create test applications** (recommended):
```bash
# Next.js (SSR/SSG testing)
pnpm dlx shadcn@latest init
```

3. **Link the library to test apps**:
```bash
# In each test application
cd your-test-app
yalc add better-blog
pnpm install
```

### Development Loop

1. **Start the library in watch mode**:
```bash
cd better-blog
pnpm dev
```
This will:
- Watch for file changes
- Rebuild the library automatically
- Push changes to all linked test applications

2. **Start your test applications** (in separate terminals):
```bash
# Terminal 2: Next.js test
cd ../your-test-app
pnpm dev
```

3. **Make changes**: Edit files in `src/`. The library will automatically rebuild and update in all linked test applications with hot reload.


### Scripts

- `pnpm dev` - Watch mode with auto-push to linked projects
- `pnpm build` - Production build
- `pnpm prepublishOnly` - Clean build before publishing (runs automatically)
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode


### Troubleshooting


## License

This project is licensed under the MIT License. See the LICENSE file for details.


TODO:
[] localization
[] (multi)sitemap generation (sitemap, robots, etc)
[] authorization (show admin ui elements, hide admin pages to non-admin users)
[] improve metadata
[] dynamic base path support (/blog, /olliethedev/blog, /news)
[] data provider adapters (postgres, redis, api)