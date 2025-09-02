import type { BlogDataProvider } from "../../types"
import { type SQLDatabaseOptions, createKyselyAdapter } from "./dialect"
import { kyselyAdapter } from "./kysely-adapter"

export async function createSQLProvider(config: {
    database: SQLDatabaseOptions
}): Promise<BlogDataProvider> {
    if (!config.database) {
        throw new Error("Database is required")
    }
    const db = config.database
    const { kysely, databaseType } = await createKyselyAdapter(db)
    if (!kysely) {
		throw new Error("Failed to initialize database adapter");
	}
	return kyselyAdapter(kysely, {
		type: databaseType || "sqlite",
	})();
}
