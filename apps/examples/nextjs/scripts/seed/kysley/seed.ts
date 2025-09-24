import { type DBSchema, createSQLProvider } from "better-blog/providers/sql"
import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"
import { getTestPosts } from "../../../../../../packages/better-blog/src/lib/data"
import { getAuthor } from "../../../../../../packages/better-blog/src/providers/__tests__/test-options"

export async function seed() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    })
    const db = new Kysely<DBSchema>({ dialect: new PostgresDialect({ pool }) })
    const provider = await createSQLProvider({
        database: { db, type: "postgres" },
        getAuthor
    })
    const testPosts = getTestPosts()
    if (!provider.createPost) {
        throw new Error("Provider createPost is undefined")
    }
    for (const post of testPosts) {
        await provider.createPost(post)
    }
    await db.destroy()
}

seed()