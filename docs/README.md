
# Better-Blog Docs

## Getting Started

Running the development server

```bash
$ pnpm install
$ pnpm dev
```

Visit [http://localhost:3000/docs](http://localhost:3000/docs) in your browser.


## How to Write Docs

1. Create `.mdx` pages inside the `app/docs/` folder.
   Example:

   ```bash
   app/docs/guide/getting-started.mdx
   ```

2. If needed customize sidebar, groups, and ordering in `source.config.ts` using `defineConfig()`.

3. Use Fumadocs UI components directly in your MDX:

   ```mdx
   import { Card } from "fumadocs-ui/components/card";

   <Card title="Welcome" href="/docs/start" />
   ```

Learn more in the [Fumadocs MDX Guide →](https://fumadocs.dev/docs/mdx)

---

## Learn More

- 🔗 [Fumadocs Documentation](https://fumadocs.dev)
- 🔗 [Next.js Documentation](https://nextjs.org/docs)

