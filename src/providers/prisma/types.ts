import type { BlogDataProviderConfig } from "@/types";

// biome-ignore lint/suspicious/noEmptyInterface: Library consumer provides PrismaClient
interface PrismaClient {}

export interface PrismaProviderOptions extends BlogDataProviderConfig {
    prisma: PrismaClient
}