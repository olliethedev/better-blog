import type { BlogDataProvider, BlogDataProviderConfig } from "../../core/types"
import { type SQLDatabaseOptions, createKyselyAdapter } from "./dialect"
import { kyselyAdapter } from "./kysely-adapter"

export type SQLProviderOptions = BlogDataProviderConfig & {
    database: SQLDatabaseOptions
}

export async function createSQLProvider(
    options: SQLProviderOptions
): Promise<BlogDataProvider> {
    const { database, ...rest } = options
    if (!database) {
        throw new Error("Database is required")
    }
    const { kysely, databaseType } = await createKyselyAdapter(database)
    if (!kysely) {
        throw new Error("Failed to initialize database adapter")
    }
    return kyselyAdapter(kysely, {
        type: databaseType || "sqlite",
        ...rest
    })()
}
