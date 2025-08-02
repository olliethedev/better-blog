import { preserveDirectivesPlugin } from "esbuild-plugin-preserve-directives"
import { defineConfig } from "tsup"

export default defineConfig((env) => {
    return {
        entry: {
            index: "./src/index.ts",
            nextjs: "./src/nextjs.ts", 
            "react-router": "./src/react-router.ts",
        },
        format: ["esm", "cjs"],
        splitting: true,
        cjsInterop: true,
        skipNodeModulesBundle: true,
        treeshake: false,
        metafile: true,
        dts: false,
        external: [
            "react",
            "react-dom", 
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-context",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-primitive",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-tabs",
            "@radix-ui/react-use-callback-ref",
            "@radix-ui/react-use-layout-effect",
            "@hookform/resolvers",
            "@tanstack/react-query",
            "class-variance-authority",
            "clsx",
            "lucide-react",
            "react-hook-form",
            "sonner",
            "tailwind-merge",
            "tailwindcss",
            "zod"
        ],
        esbuildPlugins: [
            preserveDirectivesPlugin({
                directives: ["use client", "use strict"],
                include: /\.(js|ts|jsx|tsx)$/,
                exclude: /node_modules/
            })
        ]
    }
})
