# better-blog

[![CI](https://github.com/olliethedev/better-blog/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/olliethedev/better-blog/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/olliethedev/better-blog/actions/workflows/e2e.yml/badge.svg?branch=main)](https://github.com/olliethedev/better-blog/actions/workflows/e2e.yml)
[![npm version](https://img.shields.io/npm/v/better-blog)](https://www.npmjs.com/package/better-blog)
[![npm downloads](https://img.shields.io/npm/dm/better-blog)](https://www.npmjs.com/package/better-blog)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

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


## Contribution

Better Blog is free and open source project licensed under the [MIT License](./LICENSE). You are free to do whatever you want with it.

You could help continuing its development by:

- [Contribute to the source code](./CONTRIBUTING.md)
- [Suggest new features and report issues](https://github.com/olliethedev/better-blog/issues)


---


## TODO
- internationalization unit tests for blog data providers
- localizations support in sitemap generation
- finalize page designs + admin ui
- core component overrides (Card, Heading, MarkdownEditor, MarkdownRenderer, etc.)
- blog ui translations
- add auth hooks to createBlogApiRouter config (canCreate, canUpdate, canDelete)
- lighthouse score improvements
- remix docs
- export page components via shadcn registry