#!/usr/bin/env node
import { spawn } from "node:child_process"
import { readFile } from "node:fs/promises"
import net from "node:net"
import { join } from "node:path"

function parseArgs(argv) {
    const args = {}
    for (const a of argv) {
        const [k, v] = a.split("=")
        if (k && v !== undefined) args[k.replace(/^--/, "")] = v
    }
    return args
}

const { framework, project, port, script, host } = parseArgs(
    process.argv.slice(2)
)
if (!framework || !project || !port) {
    console.error(
        "Usage: run-webserver.mjs --framework=<nextjs|react> --project=<name> --port=<number> [--script=<start|start:node|start:e2e>] [--host=<127.0.0.1|::1|0.0.0.0>]"
    )
    process.exit(2)
}

// Load env file
try {
    const envText = await readFile(`.e2e/${project}.env`, "utf8")
    for (const line of envText.split("\n")) {
        if (!line || line.trim().startsWith("#")) continue
        const idx = line.indexOf("=")
        if (idx === -1) continue
        const key = line.slice(0, idx)
        const value = line.slice(idx + 1)
        process.env[key] = value
    }
} catch {}

process.env.PORT = String(port)
process.env.HOST = host || process.env.HOST || "127.0.0.1"
process.env.HOSTNAME = process.env.HOSTNAME || process.env.HOST
process.env.E2E = process.env.E2E || "1"

// Map generic envs to Vite build-time envs when needed

if (process.env.BETTER_BLOG_PROVIDER && !process.env.VITE_BLOG_PROVIDER) {
    process.env.VITE_BLOG_PROVIDER = process.env.BETTER_BLOG_PROVIDER
}
if (process.env.API_BASE_PATH && !process.env.VITE_API_BASE_PATH) {
    process.env.VITE_API_BASE_PATH = process.env.API_BASE_PATH
}

const startScript = script || "start"
const startCmd = ["pnpm", ["--dir", `apps/examples/${framework}`, startScript]]

// Quick port availability pre-check to avoid flaky failures
function checkPortAvailable(portToCheck, hostToCheck) {
    return new Promise((resolve) => {
        const tester = net
            .createServer()
            .once("error", () => resolve(false))
            .once("listening", () => tester.close(() => resolve(true)))
            .listen(portToCheck, hostToCheck)
    })
}

let isFree = await checkPortAvailable(Number(port), process.env.HOST)
if (!isFree) {
    // Try to kill previously recorded server for this project
    try {
        const metaPath = join(".e2e", `${project}.json`)
        const metaRaw = await readFile(metaPath, "utf8")
        const { serverPid } = JSON.parse(metaRaw)
        if (serverPid) {
            try {
                process.kill(serverPid)
            } catch {}
            await new Promise((r) => setTimeout(r, 750))
            isFree = await checkPortAvailable(Number(port), process.env.HOST)
        }
    } catch {}
}
if (!isFree) {
    console.error(
        `Port ${port} on ${process.env.HOST} is already in use after cleanup. Exiting.`
    )
    process.exit(3)
}

// Log the exact command and important env for debugging
console.log(
    `[e2e] Starting ${project} → ${startCmd[0]} ${startCmd[1].join(" ")}`
)
console.log(
    `[e2e] Env: HOST=${process.env.HOST} HOSTNAME=${process.env.HOSTNAME} PORT=${process.env.PORT} NODE_ENV=${process.env.NODE_ENV || ""} BETTER_BLOG_PROVIDER=${process.env.BETTER_BLOG_PROVIDER || ""} VITE_BLOG_PROVIDER=${process.env.VITE_BLOG_PROVIDER || ""} API_BASE_PATH=${process.env.API_BASE_PATH || ""} VITE_API_BASE_PATH=${process.env.VITE_API_BASE_PATH || ""} DATABASE_URL=${process.env.DATABASE_URL ? "set" : "unset"}`
)

const proc = spawn(startCmd[0], startCmd[1], {
    stdio: "inherit",
    env: process.env
})
proc.on("exit", (code) => process.exit(code ?? 1))

// Forward termination to child to ensure clean teardown
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(sig, () => {
        try {
            process.kill(proc.pid, sig)
        } catch {}
        process.exit(0)
    })
}
