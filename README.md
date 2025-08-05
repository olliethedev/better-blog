# better-blog

A modern, type-safe React blog library designed for Next.js with first-class SSR/SSG support and clean client/server boundaries.

## Architecture Overview

### Core Design Principles

1. **Explicit Client/Server Boundaries**: Strict separation between server-safe and client-only code
2. **Configuration-Driven**: Dependency injection pattern for data access
3. **Framework Agnostic Core**: Business logic independent of React/Next.js
4. **Performance First**: SSR prefetching with zero hydration mismatches
5. **TypeScript Native**: Comprehensive type safety throughout

### Package Structure

```
better-blog/
├── src/
│   ├── index.ts          # Server-safe exports (SSR/SSG)
│   ├── client.ts         # Client-only exports ("use client")
│   ├── server.ts         # Server-specific functionality
│   ├── lib/better-blog/
│   │   ├── core/         # Framework-agnostic business logic
│   │   ├── context/      # React Context + TanStack Query
│   │   └── server/       # SSR/SSG utilities
│   └── components/       # React components
```

### Entry Points

- **`better-blog`** - Server-safe exports for SSR/SSG
- **`better-blog/client`** - Client-only components and hooks
- **`better-blog/server`** - Server-specific adapters and utilities


### Core Components

#### 1. BetterBlogCore (`src/lib/better-blog/core/`)

The framework-agnostic business logic layer:

```typescript
class BetterBlogCore {
  constructor(private config: BlogDataProvider) {}
  
  async getPosts(filter?: { slug?: string; tag?: string }): Promise<Post[]>
  async getPostBySlug(slug: string): Promise<Post | null>
  matchRoute(slug?: string[]): RouteMatch
  getStaticRoutes(): Array<{ slug: string[] }>
}
```

**Key Features:**
- Configuration-driven data access
- File-system based routing (`/posts/[slug]`)
- Comprehensive TypeScript types
- No React dependencies

#### 2. Server Adapter (`src/lib/better-blog/server/`)

Next.js App Router integration:

```typescript
function createServerAdapter(
  serverConfig: BlogDataProvider,
  queryClient: QueryClient
): BetterBlogServerAdapter
```

**Provides:**
- `generateStaticParams()` for SSG
- `generateMetadata()` for SEO
- Server component entry point
- TanStack Query prefetching

#### 3. Client Context (`src/lib/better-blog/context/`)

React state management with smart caching:

```typescript
function BlogContextProvider({ 
  routeMatch, 
  clientConfig?, 
  children 
}: BlogContextProviderProps)
```

**Features:**
- Uses server-prefetched data when available
- Falls back to client fetching with loading states
- TanStack Query integration
- Zero hydration mismatches

#### 4. Router (`src/lib/better-blog/core/router.ts`)

Pattern-based routing system:

- `/posts` → Home (list all posts)
- `/posts/[slug]` → Individual post
- Future: `/posts/tag/[tag]`, `/posts/drafts`, etc.

### Configuration System

#### Data Provider Configuration (for client and server)
```typescript
interface BlogDataProvider {
  getAllPosts: (filter?) => Promise<Post[]>;
  getPostBySlug?: (slug: string) => Promise<Post | null>;
}
```

### Performance Strategy

1. **SSR Path**: Server prefetches → Client hydrates from cache (no loading states)
2. **CSR Path**: Client fetches directly via TanStack Query (with loading states)
3. **Smart Caching**: 5-minute stale time, 10-minute garbage collection
4. **Bundle Optimization**: Tree-shaking friendly, peer dependencies

### Build System

- **tsup** with ESM/CJS dual builds
- **Directive Preservation** for proper client/server boundaries
- **Type Generation** with `.d.ts` files
- **External Dependencies** to avoid version conflicts

## Features

- [x] Server-side rendering (SSR) support
- [x] Static site generation (SSG) support  
- [x] Client-side routing with loading states
- [x] TanStack Query integration for caching
- [x] TypeScript-first development
- [x] Configurable data sources
- [x] Component dependency injection
- [ ] Tag-based filtering
- [ ] Draft post management
- [ ] Post editing interface
- [ ] Search functionality
- [ ] Infinite scroll pagination

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
yalc publish
```

2. **Create test applications** (recommended):
```bash
# Next.js (SSR/SSG testing)
pnpm dlx shadcn@latest init

# Vite React (Client-only testing)  
# todo


```

3. **Link the library to test apps**:
```bash
# In each test application
cd your-test-app
yalc add better-blog
pnpm install


# Repeat for other test apps
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
npm run dev

# Terminal 3: Vite test  
#todo
```

3. **Make changes**: Edit files in `src/`. The library will automatically rebuild and update in all linked test applications with hot reload.

### Testing Across Frameworks

Your test applications should verify:

**Server-Side Rendering (Next.js/Remix)**:
- Components render correctly on the server
- Proper hydration on the client
- No browser-only APIs in server components

**Client-Side Only (Vite/CRA)**:
- Components work without SSR
- Bundle size is reasonable
- Tree-shaking works correctly

### Scripts

- `pnpm dev` - Watch mode with auto-push to linked projects
- `pnpm build` - Production build
- `pnpm prepublishOnly` - Clean build before publishing (runs automatically)

### Publishing

When ready to publish:
```bash
# Version bump
npm version patch # or minor/major

# Publish (prepublishOnly script runs automatically)
npm publish
```

### Troubleshooting

**Library not updating in test apps?**
- Run `yalc push` manually from the library directory
- Check that `yalc add better-blog` was run in test apps
- Restart the test application dev server

**Build issues?**
- Clear dist: `rm -rf dist && pnpm build`
- Check TypeScript errors: `tsc --noEmit`

## License

This project is licensed under the MIT License. See the LICENSE file for details.
