import { Pool } from "pg"
import { migrateToLatest } from "./migrate"
import type { DBSchema } from "better-blog/providers/sql"

import {
    Kysely,
    PostgresDialect,
    sql
} from "kysely"

export async function init() {
    console.log("Initializing database")
    console.log(process.env.DATABASE_URL)
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    })
    let db: Kysely<DBSchema>
    db = new Kysely<DBSchema>({ dialect: new PostgresDialect({ pool }) })

    // Recreate schema for a clean slate
    await sql`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`.execute(
        db
    )

    await migrateToLatest(db)

    await db.destroy()
}

init()