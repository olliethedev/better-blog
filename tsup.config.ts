import path from "node:path"
import { preserveDirectivesPlugin } from "esbuild-plugin-preserve-directives"
import { defineConfig } from "tsup"

export default defineConfig((env) => {
    return {
        entry: {
            index: "./src/index.ts",
            client: "./src/client.ts",
            server: "./src/server.ts",
            "server/api": "./src/server/api.ts",
            "server/sitemap": "./src/server/sitemap.ts",
            "server/sql": "./src/server/sql.ts",
            "server/prisma": "./src/server/prisma.ts",
            "server/drizzle": "./src/server/drizzle.ts"
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
