import type { BlogDataProviderConfig, Post } from "@/types";

export interface CreateMemoryProviderOptions  extends BlogDataProviderConfig{
    seedPosts?: Post[]
}