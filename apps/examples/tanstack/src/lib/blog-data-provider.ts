import { BlogDataProvider } from "better-blog";
import { createSeededMemoryProvider } from "better-blog/providers/memory"

const provider = createSeededMemoryProvider()

// Your blog configuration - implement these functions to fetch your data
export const blogDataProvider: BlogDataProvider = await provider;