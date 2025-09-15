/** @jest-environment node */
import * as fs from "node:fs/promises"
import * as path from "node:path"
import { sql as drizzleSql } from "drizzle-orm"
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres"
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect, sql } from "kysely"
import { Pool } from "pg"

import type { BlogDataProvider } from "@/types"
import { getAuthor } from "../../providers/__tests__/test-options"
import { createDrizzleProvider } from "../drizzle/drizzle-provider"
import { commonProviderTests } from "./common-provider-tests"

// Reuse the existing Kysely migrations to prepare the schema
import type { DBSchema } from "../sql/kysely-adapter"

let pool: Pool
let kyselyDb: Kysely<DBSchema>
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
    // Matches docker-compose: host: localhost, port: 5432, user: user, password: password, database: better_blog
    pool = new Pool({
        host: "localhost",
        port: 5432,
        user: "user",
        password: "password",
        database: "better_blog",
        max: 4,
    })

    kyselyDb = new Kysely<DBSchema>({ dialect: new PostgresDialect({ pool }) })

    // Reset schema for a clean slate and run migrations
    await sql`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`.execute(kyselyDb)
    await migrateToLatest(kyselyDb)

    // Initialize a Drizzle client on the same Pool and build the provider
    const drizzleDb = drizzleNodePostgres(pool)
    provider = await createDrizzleProvider({
        drizzle: drizzleDb as unknown as object,
        sql: drizzleSql,
        getAuthor
    })
}, 30000)

afterAll(async () => {
    await kyselyDb?.destroy()
})

describe("Drizzle provider (Postgres)", () => {
    commonProviderTests(() => {
        return provider
    })
})


