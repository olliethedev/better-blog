import { Kysely, PostgresDialect } from "kysely"
import { getAuthor } from "../../../../../../packages/better-blog/src/providers/__tests__/test-options"
import { getTestPosts } from "../../../../../../packages/better-blog/src/lib/data"
import { createSQLProvider, DBSchema } from "better-blog/providers/sql"
import { Pool } from "pg"

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