import path from "node:path"
import { preserveDirectivesPlugin } from "esbuild-plugin-preserve-directives"
import { defineConfig } from "tsup"

export default defineConfig((env) => {
    return {
        entry: {
            types: "./src/types/index.ts",
            index: "./src/index.ts",
            client: "./src/client.ts",
            queries: "./src/queries/index.ts",
            hooks: "./src/hooks/index.ts",
            router: "./src/router/index.ts",
            "router/client": "./src/router/pluggable-routes.tsx",
            context: "./src/context/index.ts",
            api: "./src/api/index.ts",
            "server/pages": "./src/server/pages/index.tsx",
            sitemap: "./src/sitemap/index.ts",
            "providers/api": "./src/providers/api/index.ts",
            "providers/drizzle": "./src/providers/drizzle/index.ts",
            "providers/memory": "./src/providers/memory/index.ts",
            "providers/prisma": "./src/providers/prisma/index.ts",
            "providers/sql": "./src/providers/sql/index.ts"
        },
        format: ["esm", "cjs"],
        splitting: true,
        cjsInterop: true,
        skipNodeModulesBundle: true,
        treeshake: false,
        metafile: true,
        dts: { resolve: true },
        esbuildPlugins: [
            preserveDirectivesPlugin({
                directives: ["use client", "use strict"],
                include: /\.(js|ts|jsx|tsx)$/,
                exclude: /node_modules/
            })
        ],
        esbuildOptions(opts) {
            opts.alias = {
                "@": path.resolve(__dirname, "src")
            }
        }
    }
})
