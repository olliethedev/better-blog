# Contributing to Better Blog

Thanks for your interest in contributing to Better Blog! This guide explains how to set up the repo, develop, test, and open high‑quality pull requests.

## Code of Conduct

Please read and follow our [Code of Conduct](/CODE_OF_CONDUCT.md).

## Monorepo layout

```
.
├─ apps/
│  ├─ docs/                  # Documentation site (Next.js)
│  └─ examples/nextjs/       # Example app used by E2E tests
├─ packages/
│  └─ better-blog/           # Published library package
├─ e2e/                      # Playwright E2E suite
├─ pnpm-workspace.yaml       # Workspace globs
├─ turbo.json                # Turborepo pipeline
└─ package.json              # Workspace scripts
```

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm (repo uses `pnpm@10.12.1`)

## Getting started

1. Fork and clone your fork:
   ```bash
   git clone https://github.com/<your-username>/better-blog.git
   cd better-blog
   ```
2. Install dependencies (workspace):
   ```bash
   pnpm -w install
   ```
3. Build everything once:
   ```bash
   pnpm -w build
   ```
4. Start developing:
   ```bash
   # Watch the library build
   pnpm --filter better-blog dev

   # Run the docs locally
   pnpm --filter better-blog-docs dev
   ```

Optional: if testing the library inside another app, you can use [yalc](https://github.com/wclr/yalc) from `packages/better-blog/`.

## Workspace commands

- `pnpm -w install` – install all dependencies
- `pnpm -w build` – build all packages/apps
- `pnpm -w test` – run all tests
- `pnpm -w e2e` – run all e2e tests
- `pnpm -w lint` – run lint tasks across the workspace


- Per‑package: `pnpm --filter <name> <script>` (e.g., `pnpm --filter better-blog test`)

## Linting and formatting

- Run the workspace lint:
  ```bash
  pnpm -w lint
  ```
- This repo uses Biome (see `biome.json`). If you need to run Biome directly within the library package:
  ```bash
  pnpm --filter better-blog exec biome check .
  pnpm --filter better-blog exec biome format --write .
  ```

## Tests

### Unit tests (library)

```bash
pnpm --filter better-blog test
pnpm --filter better-blog test:coverage
```

### End‑to‑end tests (Playwright)

Quick start:
```bash
pnpm e2e:install   # install browsers
pnpm -w build      # build workspace targets the tests depend on
pnpm e2e           # run all projects
```

Run a single E2E project:
```bash
pnpm e2e --project=nextjs-memory
pnpm e2e --project=nextjs-sql-pg
```

Notes:
- E2E projects spin up example apps and, for SQL, provision Postgres via Testcontainers.
- See `e2e/README.md` for details, ports, and conventions.

## Development workflow

1. Create a feature branch:
   ```bash
   git checkout -b feat/short-description
   # or: fix/, docs/, refactor/, test/, chore/
   ```
2. Make focused changes. Prefer small, reviewable PRs.
3. Add/adjust tests.
4. Ensure lint and tests pass locally.
5. Commit with clear messages (Conventional style encouraged):
   - `feat: ...` new functionality
   - `fix: ...` bug fixes
   - `docs: ...` docs‑only changes
   - `refactor: ...` internal refactors
   - `test: ...` tests only
   - `chore: ...` tooling/deps/etc
6. Push and open a Pull Request against `main`.

In your PR description, include:
- What changed and why
- Any breaking changes
- Screenshots for UI changes
- Related issues (e.g., “Closes #123”)

## Code style & guidelines

- TypeScript‑first: prefer explicit types on public APIs.
- Keep functions small and focused; favor early returns over deep nesting.
- Use meaningful names; avoid abbreviations.
- Add concise comments for non‑obvious logic (explain “why”, not “how”).
- Avoid classes in the library unless a class is the clearest construct.
- Maintain backward compatibility; if breaking, document migration steps.

### Package: `packages/better-blog`

- Public APIs should be well‑typed and documented via JSDoc where helpful.
- Keep the core framework‑agnostic; framework specifics live in examples/docs.
- Data providers should follow performance best practices (see provider note below).

### Docs: `apps/docs`

- Keep docs in sync with code changes.
- Prefer minimal, runnable examples.
- Use clear, concise language and consistent tone.

### Providers

- Memory provider: prefer simple in‑memory operations suitable for small datasets.
- Real DB providers (Prisma/SQL/Kysely/Drizzle): perform filtering, sorting, and pagination at the database level to handle large datasets efficiently.

## Pull Request checklist

See the [pull request template](/PULL_REQUEST_TEMPLATE.md) for the pull request checklist.


## License

MIT — see [LICENSE](/LICENSE).