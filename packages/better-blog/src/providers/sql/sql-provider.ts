import type { BlogDataProvider } from "@/types"
import { createKyselyAdapter } from "./dialect"
import { kyselyAdapter } from "./kysely-adapter"
import type { SQLProviderOptions } from "./types"

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
