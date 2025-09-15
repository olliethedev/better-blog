import { exec } from "node:child_process"

function execute(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${command}`)
                console.error(`stderr: ${stderr}`)
                reject(error)
                return
            }
            if (stderr) {
                console.warn(`Command produced stderr: ${stderr}`)
            }
            resolve(stdout)
        })
    })
}

export async function pushPrismaSchema(): Promise<void> {
    await execute("pnpm prisma:test:generate")
    await execute("pnpm prisma:test:push")
}


