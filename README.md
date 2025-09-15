# better-blog (monorepo)

Add a production-ready, SEO-friendly blog to your React app in minutes. better-blog is a framework-agnostic (React, Next.js, React Router, Tanstack Start, etc...), type-safe router + component set with drop-in setup, SSR/SSG out of the box, and full customization—works with modern frameworks like Next.js App Router and React Router.

---

⚠️ This repository is a WORK IN PROGRESS and is under active development.
Do not use it in production until it is stable 1.0.0

---

Read the docs at [better-blog.com](https://www.better-blog.com).

### Highlights

- **Plug and play blog in minutes**: One provider + one catch-all route
- **Fully customizable UI**: Override any page or loading component; keep your design system
- **Bring your own content source**: Pluggable `BlogDataProvider` for CMS/API/files/DB
- **Works anywhere**: Next.js App Router or React Router with the same core
- **TypeScript-first DX**: Strong types across routes, hooks, and providers
- **SEO-first by default**: SSR/SSG support, route-aware metadata helpers, hydration-safe rendering


---

## Installation

```bash
pnpm add better-blog
```

## Usage 

Learn how to use Better Blog in your project by following the [installation guide](https://www.better-blog.com/docs/installation).

---

## Architecture

- **Design**
  - Schema-driven routes and data; minimal state in components
  - Strict client/server separation via dedicated entry points

---

## Monorepo layout

```
.
├─ apps/
│  └─ docs/                 # Documentation site (Next.js)
├─ packages/
│  └─ better-blog/          # Published library package
├─ pnpm-workspace.yaml      # pnpm workspace globs
├─ turbo.json               # Turborepo pipeline
├─ tsconfig.base.json       # Shared TS config
└─ package.json             # Workspace scripts
```

## Workspace commands

- `pnpm -w install` – install all deps
- `pnpm -w build` – build all packages/apps in topological order
- `pnpm --filter better-blog dev` – watch the library
- `pnpm --filter better-blog test` – run library tests
- `pnpm --filter better-blog-docs dev` – run docs locally

## Developing the library

### Prereqs

```bash
pnpm install
```

Optional: for local linking use [yalc](https://github.com/wclr/yalc).

### Common commands

- `pnpm --filter better-blog dev` – watch build
- `pnpm --filter better-blog build` – production build (ESM + CJS + types)
- `docker compose up -d` – start local database for tests
- `pnpm --filter better-blog test` – run unit tests

### Testing locally in an app

```bash
cd packages/better-blog/
yalc publish --push
# in your app
yalc add better-blog && pnpm install
```

---

## License

MIT

---

## Roadmap (short)
- clean up type definitions, variable names, etc.
- e2e tests
- add example projects
- internationalization unit tests for blog data providers
- localizations support in sitemap generation
- finalize page designs + admin ui
- core component overrides (Card, Heading, MarkdownEditor, MarkdownRenderer, etc.)
- blog ui translations
- add auth hooks to createBlogApiRouter config (canCreate, canUpdate, canDelete)
- richer metadata helpers (og:image, canonical url, etc.)
- lighthouse score improvements
- remix docs
- export page components via shadcn registry