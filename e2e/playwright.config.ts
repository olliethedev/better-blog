import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 90_000,
  forbidOnly: !!process.env.CI,
  outputDir: "../test-results",
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"]],
  expect: {
    timeout: 10_000,
  },
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  retries: process.env["CI"] ? 2 : 0,
  use: {
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    baseURL: "http://localhost:3000",
  },
  webServer: [
    // Next.js with memory provider
    {
      command: "pnpm -F nextjs run start:e2e",
      port: 3001,
      reuseExistingServer: !process.env["CI"],
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        PORT: "3001",
        HOST: "127.0.0.1",
        BETTER_BLOG_PROVIDER: "memory",
      },
    },
    // Next.js with SQL provider
    {
      command:
        "tsx ../apps/examples/nextjs/scripts/seed/kysley/init.ts && pnpm -F nextjs run start:e2e",
      port: 3002,
      reuseExistingServer: !process.env["CI"],
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        PORT: "3002",
        HOST: "127.0.0.1",
        BETTER_BLOG_PROVIDER: "sql",
        DATABASE_URL: "postgres://user:password@localhost:5432/better_blog",
      },
    },
    // React SPA with memory provider
    {
      command: "pnpm -F better-blog-react-router-dom run start:e2e",
      port: 3003,
      reuseExistingServer: !process.env["CI"],
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        PORT: "3003",
        HOST: "127.0.0.1",
      },
    },
    // React SPA + Node.js API with memory provider
    {
      command: "pnpm -F better-blog-react-router-dom run start:e2e:api",
      port: 3004,
      reuseExistingServer: !process.env["CI"],
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        PORT: "3004",
        HOST: "127.0.0.1",
        API_BASE_PATH: "/api/posts",
        BETTER_BLOG_PROVIDER: "memory",
      },
    },
  ],
  projects: [
    {
      name: "nextjs:memory",
      use: { baseURL: "http://localhost:3001" },
      testMatch: ["**/*.spec.ts"],
    },
    {
      name: "nextjs:sql",
      use: { baseURL: "http://localhost:3002" },
      testMatch: ["**/*.spec.ts"],
    },
    {
      name: "react:memory",
      use: { baseURL: "http://localhost:3003" },
      testMatch: ["**/*.spec.ts"],
    },
    {
      name: "react:api",
      use: { baseURL: "http://localhost:3004" },
      testMatch: ["**/*.spec.ts"],
    },
  ],
});
