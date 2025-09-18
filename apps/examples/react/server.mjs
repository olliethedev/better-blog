import fs from "node:fs"
import http from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createBlogApiRouter } from "better-blog/api"
import { createSeededMemoryProvider } from "better-blog/providers/memory"
import { createSQLProvider } from "better-blog/providers/sql"
import { toNodeHandler } from "better-call/node"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function parseArgs(argv) {
    const args = {}
    for (const a of argv) {
        const [k, v] = a.split("=")
        if (k && v !== undefined) args[k.replace(/^--/, "")] = v
    }
    return args
}

async function main() {
    // Parse command line arguments
    const args = await parseArgs(process.argv.slice(2))
    
    const port = Number(process.env.PORT || 3005)
    const host = process.env.HOST || "127.0.0.1"
    const basePath = process.env.API_BASE_PATH || "/api/posts"

    // Get provider based on environment variable
    const providerType = process.env.BETTER_BLOG_PROVIDER || 'memory'
    console.log(`Using provider: ${providerType}`)
    
    let provider
    if (providerType === 'sql') {
        const url = process.env.DATABASE_URL
        if (!url) throw new Error('DATABASE_URL is required for SQL provider')
        
        try {
            // Dynamically import pg to avoid requiring it for memory provider
            const { Pool } = await import('pg')
            const pool = new Pool({ connectionString: url })
            provider = await createSQLProvider({ database: pool })
        } catch (err) {
            console.error('Failed to initialize SQL provider:', err)
            throw err
        }
    } else {
        // Default to memory provider
        provider = await createSeededMemoryProvider()
    }
    
    const router = createBlogApiRouter({ provider, basePath })
    const apiHandler = toNodeHandler(router.handler)

    // Use custom dist directory if specified via command line arguments
    const distDir = path.join(__dirname, args["dist-dir"] || "dist")
    console.log(`Using dist directory: ${distDir}`)
    const indexHtml = path.join(distDir, "index.html")

    function getContentType(filePath) {
        const ext = path.extname(filePath).toLowerCase()
        switch (ext) {
            case ".html":
                return "text/html; charset=utf-8"
            case ".js":
                return "text/javascript; charset=utf-8"
            case ".css":
                return "text/css; charset=utf-8"
            case ".json":
                return "application/json; charset=utf-8"
            case ".svg":
                return "image/svg+xml"
            case ".png":
                return "image/png"
            case ".jpg":
            case ".jpeg":
                return "image/jpeg"
            case ".gif":
                return "image/gif"
            case ".woff":
                return "font/woff"
            case ".woff2":
                return "font/woff2"
            case ".ttf":
                return "font/ttf"
            default:
                return "application/octet-stream"
        }
    }

    const server = http.createServer((req, res) => {
        if (!req.url) {
            res.statusCode = 400
            res.end("Bad Request")
            return
        }

        if (req.url.startsWith(basePath)) {
            apiHandler(req, res)
            return
        }

        const urlPath = req.url.split("?")[0]
        const filePath = path.join(distDir, urlPath)

        fs.stat(filePath, (err, stats) => {
            if (!err && stats.isFile()) {
                res.setHeader("Content-Type", getContentType(filePath))
                fs.createReadStream(filePath).pipe(res)
                return
            }
            res.setHeader("Content-Type", "text/html; charset=utf-8")
            fs.createReadStream(indexHtml).pipe(res)
        })
    })

    server.listen(port, host, () => {
        console.log(`Server listening on http://${host}:${port}`)
    })
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
