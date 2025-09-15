import type { BlogDataProviderConfig } from "@/types"

// Very loose typing on purpose: consumer's Drizzle client is external to this lib
// biome-ignore lint/suspicious/noEmptyInterface: Library consumer provides Drizzle DB client
interface DrizzleDb {}

export interface DrizzleProviderOptions extends BlogDataProviderConfig {
    drizzle: DrizzleDb
    // Optional: consumer may pass their `sql` tag from drizzle-orm
    // biome-ignore lint/suspicious/noExplicitAny: external type
    sql: any
}