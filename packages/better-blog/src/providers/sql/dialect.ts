import type { Database as BunDatabase } from "bun:sqlite"
// import type { DatabaseSync } from "node:sqlite";
import type { Database } from "better-sqlite3"
import { Kysely, MssqlDialect } from "kysely"
import type { Dialect, MysqlPool, PostgresPool } from "kysely"
import { MysqlDialect, PostgresDialect, SqliteDialect } from "kysely"
export type KyselyDatabaseType = "postgres" | "mysql" | "sqlite" | "mssql"
export type SQLDatabaseOptions =
    | PostgresPool
    | MysqlPool
    | Database
    | Dialect
    | BunDatabase
    // | DatabaseSync
    | {
          dialect: Dialect
          type: KyselyDatabaseType
          /**
           * casing for table names
           *
           * @default "camel"
           */
          casing?: "snake" | "camel"
      }
    | {
          /**
           * Kysely instance
           */

          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          db: Kysely<any>
          /**
           * Database type between postgres, mysql and sqlite
           */
          type: KyselyDatabaseType
          /**
           * casing for table names
           *
           * @default "camel"
           */
          casing?: "snake" | "camel"
      }

export function getKyselyDatabaseType(
    db: SQLDatabaseOptions
): KyselyDatabaseType | null {
    if (!db) {
        return null
    }
    if ("dialect" in db) {
        return getKyselyDatabaseType(db.dialect as Dialect)
    }
    if ("createDriver" in db) {
        if (db instanceof SqliteDialect) {
            return "sqlite"
        }
        if (db instanceof MysqlDialect) {
            return "mysql"
        }
        if (db instanceof PostgresDialect) {
            return "postgres"
        }
        if (db instanceof MssqlDialect) {
            return "mssql"
        }
    }
    if ("aggregate" in db) {
        return "sqlite"
    }

    if ("getConnection" in db) {
        return "mysql"
    }
    if ("connect" in db) {
        return "postgres"
    }
    if ("fileControl" in db) {
        return "sqlite"
    }
    if ("open" in db && "close" in db && "prepare" in db) {
        return "sqlite"
    }
    return null
}

export const createKyselyAdapter = async (db: SQLDatabaseOptions) => {
    if (!db) {
        return {
            kysely: null,
            databaseType: null
        }
    }

    if ("db" in db) {
        return {
            kysely: db.db,
            databaseType: db.type
        }
    }

    if ("dialect" in db) {
        return {
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            kysely: new Kysely<any>({ dialect: db.dialect }),
            databaseType: db.type
        }
    }

    let dialect: Dialect | undefined = undefined

    const databaseType = getKyselyDatabaseType(db)

    if ("createDriver" in db) {
        dialect = db
    }

    if ("aggregate" in db && !("createSession" in db)) {
        dialect = new SqliteDialect({
            database: db
        })
    }

    if ("getConnection" in db) {
        // @ts-ignore - mysql2/promise
        dialect = new MysqlDialect(db)
    }

    if ("connect" in db) {
        dialect = new PostgresDialect({
            pool: db
        })
    }

    if ("fileControl" in db) {
        const { BunSqliteDialect } = await import("./bun-sqlite-dialect")
        dialect = new BunSqliteDialect({
            database: db
        })
    }

    // if ("createSession" in db) {
    // 	let DatabaseSync: typeof import("node:sqlite").DatabaseSync | undefined =
    // 		undefined;
    // 	try {
    // 		({ DatabaseSync } = await import("node:sqlite"));
    // 	} catch (error: unknown) {
    // 		if (
    // 			error !== null &&
    // 			typeof error === "object" &&
    // 			"code" in error &&
    // 			error.code !== "ERR_UNKNOWN_BUILTIN_MODULE"
    // 		) {
    // 			throw error;
    // 		}
    // 	}
    // 	if (DatabaseSync && db instanceof DatabaseSync) {
    // 		const { NodeSqliteDialect } = await import("./node-sqlite-dialect");
    // 		dialect = new NodeSqliteDialect({
    // 			database: db,
    // 		});
    // 	}
    // }

    return {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        kysely: dialect ? new Kysely<any>({ dialect }) : null,
        databaseType
    }
}
