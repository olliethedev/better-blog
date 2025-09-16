## Local env configuration

Copy an env example to run locally:

```bash
cp .env.local.example .env.local
```

- Default runs with in-memory provider: `BETTER_BLOG_PROVIDER=memory`.
- To run with Postgres, set:
  - `BETTER_BLOG_PROVIDER=sql`
  - `DATABASE_URL=postgres://user:password@127.0.0.1:5432/better_blog`

Then start the app:

```bash
pnpm dev
# or production
pnpm build && pnpm start
```
