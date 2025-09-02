import type { BlogDataProvider } from "../types"

export interface StorageDataProviderConfig {
    /**
     * Function to get author by id. If not provided, the author will be null.
     */
    getAuthor?: BlogDataProvider["getAuthor"]
    /**
     * Default locale to use when a method call does not specify one.
     * @default "en"
     */
    defaultLocale?: string
}