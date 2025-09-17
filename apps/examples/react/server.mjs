import fs from "node:fs"
import http from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createBlogApiRouter } from "better-blog/api"
import { createSeededMemoryProvider } from "better-blog/providers/memory"
import { toNodeHandler } from "better-call/node"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
    const port = Number(process.env.PORT || 3005)
    const host = process.env.HOST || "127.0.0.1"
    const basePath = process.env.API_BASE_PATH || "/api/posts"

    const provider = await createSeededMemoryProvider()
    const router = createBlogApiRouter({ provider, basePath })
    const apiHandler = toNodeHandler(router.handler)

    const distDir = path.join(__dirname, "dist")
    const indexHtml = path.join(distDir, "index.html")

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
                fs.createReadStream(filePath).pipe(res)
                return
            }
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
