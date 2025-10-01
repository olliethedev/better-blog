import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
// vite.config.ts
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '/node_modules/highlight.js/styles/': resolve(__dirname, 'node_modules/highlight.js/styles/'),
    },
  },
  ssr:{
    noExternal: ['highlight.js'],
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  optimizeDeps: {
    include: ['highlight.js'],
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({ customViteReactPlugin: true }),
    viteReact(),
    tailwindcss(),
    {
      name: 'handle-highlight-css',
      resolveId(id) {
        // Match imports like "/node_modules/highlight.js/styles/atom-one-dark.css"
        if (id.startsWith('/node_modules/highlight.js/styles/') && id.endsWith('.css')) {
          const cssFile = id.replace('/node_modules/highlight.js/styles/', '');
          return {
            id: `highlight.js/styles/${cssFile}`,
            external: false,
          };
        }
      }
    },
  ],
})