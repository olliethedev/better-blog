import type { BlogDataProviderConfig } from "@/types"
import type { SQLDatabaseOptions } from "./dialect"

export type SQLProviderOptions = BlogDataProviderConfig & {
    database: SQLDatabaseOptions
}
