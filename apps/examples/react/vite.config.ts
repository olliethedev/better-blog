import path from "node:path"
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(), 
    viteCommonjs()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    preserveSymlinks: false,
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    // Ensure local yalc package isn't pre-bundled so edits trigger reloads
    // exclude: ["better-blog", "better-blog/client"],
  },
  server: {
    fs: {
      // Explicitly allow Vite to serve files from project root and `.yalc`
      allow: [
        path.resolve(__dirname),
        path.resolve(__dirname, ".yalc"),
      ],
    },
    watch: {
      // Do not ignore updates for the linked package inside node_modules
      ignored: (watchPath: string) => {
        const isNodeModules = watchPath.includes(`${path.sep}node_modules${path.sep}`)
        const isBetterBlog = watchPath.includes(`${path.sep}node_modules${path.sep}better-blog${path.sep}`)
        return isNodeModules && !isBetterBlog
      },
    },
  },
})
