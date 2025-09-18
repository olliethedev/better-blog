import type { BlogDataProviderConfig } from "@/types"
import type { SQLDatabaseOptions } from "./dialect"
export { DBSchema } from "./kysely-adapter"

export type SQLProviderOptions = BlogDataProviderConfig & {
    database: SQLDatabaseOptions
}
