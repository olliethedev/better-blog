import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: "./tests",
    timeout: 90_000,
    forbidOnly: !!process.env.CI,
    outputDir: "../test-results",
    reporter: process.env.CI
        ? [["list"], ["html", { open: "never" }]]
        : [["list"]],
    expect: {
        timeout: 10_000
    },
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    retries: process.env["CI"] ? 2 : 0,
    use: {
        trace: "retain-on-failure",
        video: "retain-on-failure",
        screenshot: "only-on-failure",
        actionTimeout: 15_000,
        navigationTimeout: 30_000
    },
    projects: [
        // Setup/teardown for Next.js + memory
        {
            name: "setup nextjs-memory",
            testMatch: /global\.setup\.nextjs-memory\.ts/,
            teardown: "cleanup nextjs-memory"
        },
        {
            name: "cleanup nextjs-memory",
            testMatch: /global\.teardown\.nextjs-memory\.ts/
        },
        {
            name: "nextjs-memory",
            workers: 1,
            dependencies: ["setup nextjs-memory"],
            use: { baseURL: "http://localhost:3001" }
        },

        // Setup/teardown for Next.js + SQL (Postgres via Testcontainers)
        {
            name: "setup nextjs-sql-pg",
            testMatch: /global\.setup\.nextjs-sql-pg\.ts/,
            teardown: "cleanup nextjs-sql-pg"
        },
        {
            name: "cleanup nextjs-sql-pg",
            testMatch: /global\.teardown\.nextjs-sql-pg\.ts/
        },
        {
            name: "nextjs-sql-pg",
            workers: 1,
            dependencies: ["setup nextjs-sql-pg"],
            use: { baseURL: "http://localhost:3002" }
        }
    ]
})


