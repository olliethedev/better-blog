import { type inferQueryKeyStore, mergeQueryKeys } from "@lukemorales/query-key-factory";
import type { BlogDataProvider } from "../types";
import { createDraftsQueries } from "./drafts";
import { createPostsQueries } from "./posts";
import { createTagsQueries } from "./tags";

export function createBlogQueries(provider: BlogDataProvider) {
  const posts = createPostsQueries(provider);
  const tags = createTagsQueries(provider);
  const drafts = createDraftsQueries(provider);

  return mergeQueryKeys(posts, tags, drafts);
}

export type QueryKeys = inferQueryKeyStore<ReturnType<typeof createBlogQueries>>;


