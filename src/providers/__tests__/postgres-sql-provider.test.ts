import * as fs from "node:fs/promises"
import * as path from "node:path"
/** @jest-environment node */
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect, sql } from "kysely"
import { Pool } from "pg"

import type { BlogDataProvider } from "../../core/types"
import { getAuthor } from "../../providers/__tests__/test-options"
import { createSQLProvider } from "../sql/sql-provider"
import { commonProviderTests } from "./common-provider-tests"

/**
 * This test suite initializes a Postgres database via docker-compose service
 * (hostname: localhost, port: 5432, user: user, password: password, db: better_blog)
 * then runs Kysely migrations and executes the shared provider tests.
 */

let pool: Pool
import type { DBSchema } from "../sql/kysely-adapter"

let db: Kysely<DBSchema>
let provider: BlogDataProvider

async function migrateToLatest(kysely: Kysely<DBSchema>) {
    const migrationFolder = path.join(
        process.cwd(),
        "src/providers/__tests__/migrations/postgres",
    )
    const migrator = new Migrator({
        db: kysely,
        provider: new FileMigrationProvider({ fs, path, migrationFolder }),
        migrationTableName: "blog_migrations",
        migrationLockTableName: "blog_migrations_lock",
    })
    const { error } = await migrator.migrateToLatest()
    if (error) throw error
}

beforeAll(async () => {
    pool = new Pool({
        host: "localhost",
        port: 5432,
        user: "user",
        password: "password",
        database: "better_blog",
        max: 4,
    })

    db = new Kysely<DBSchema>({ dialect: new PostgresDialect({ pool }) })

    // Recreate schema for a clean slate
    await sql`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`.execute(db)
    await migrateToLatest(db)
    provider = await createSQLProvider({ database: { db, type: "postgres" }, getAuthor })
}, 30000)

afterAll(async () => {
    await db?.destroy()
})

describe("Postgres SQL Provider", () => {
    commonProviderTests(() => {
        return provider
    })
})


