# End-to-End Tests

This folder contains the Playwright-based E2E suite for validating Better Blog across frameworks and data providers.

## How it works

- We use Playwright "project dependencies" for setup/teardown. See the Playwright docs: https://playwright.dev/docs/test-global-setup-teardown
- Each matrix cell (framework × provider × DB) is modeled as its own project.
- Setup projects:
  - Provision unique resources per project (e.g., SQLite file or a Postgres Testcontainers container).
  - Run migrations and seed minimal data.
  - Start the target example app server on a dedicated port.
- Teardown projects clean up (delete SQLite files, stop/remove containers, kill servers).
- Tests are framework-agnostic where possible and run against the example apps.

## Quick start

```bash
pnpm install
pnpm e2e:install
pnpm -w build
pnpm e2e
```

Run a single project:

```bash
pnpm e2e --project=nextjs-memory
pnpm e2e --project=nextjs-sql-pg
```

Open UI mode:

```bash
pnpm e2e:ui
```

## Adding a new framework (e.g., TanStack Start, React Router)

1. Create an example app under `apps/examples/<framework>` with scripts:
   - `build`, `start` (use `$PORT`) and optionally `start:e2e`.
2. Ensure the app’s API routes use `BETTER_BLOG_PROVIDER` to pick the provider.
3. Add projects to `e2e/playwright.config.ts`:
   - `setup <framework>-<provider>` and `<framework>-<provider>`
   - Choose unique ports (e.g., 3002, 3003).
4. Create setup/teardown files under `e2e/tests/` following existing patterns.
5. Reuse the smoke tests under `e2e/tests/` if the routes are compatible.

## Adding a new provider

- Memory: load seeded data at app boot when `E2E=1`.
- SQL (Kysely):
  - Use docker to provision Postgres (or connect to SQLite via file).
  - Reuse migrations from `packages/better-blog/src/providers/__tests__/migrations/postgres` or add new migrations.
  - Run migrations in setup before starting the app.
- Prisma/Drizzle:
  - Add provider-specific setup to apply schema (`prisma db push`, `drizzle-kit push` or equivalent) and seed.
  - Put reusable seeding helpers in `e2e/fixtures/` if needed.

## Adding a new database engine

- SQLite:
  - Use a unique file per project under `.e2e/sqlite/<name>.db`.
- Postgres, MySQL or others:
  - Start the containers via `docker compose up -d`

## Client-only providers (3rd-party APIs)

- Prefer Playwright route interception to mock network.
- Alternatively, start a tiny stub server in setup and pass its base URL to the example app via env.

## Conventions

- Ports: reserve distinct ports per framework (e.g., Next.js 3001/3002, TanStack 3003, Router 3004).

## CI

- GitHub Actions workflow in `.github/workflows/e2e.yml` installs deps, browsers, builds, and runs Playwright with artifacts on failure.

## Tips

- Keep `workers: 1` per project to avoid DB contention. Increase parallelism by adding more projects, not more workers.
- Use tags or `--project` to scope runs locally while iterating.
- If bringing a new provider, ensure tests remain deterministic with a seeded dataset.
