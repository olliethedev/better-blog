import { createQueryKeys } from "@lukemorales/query-key-factory";
import type { QueryFunctionContext } from "@tanstack/react-query"
import type { BlogDataProvider, Post } from "../types";

export interface DraftsListParams {
  limit?: number;
}

export function createDraftsQueries(provider: BlogDataProvider) {
  return createQueryKeys("drafts", {
    list: (params: DraftsListParams | undefined) => ({
      queryKey: [{ limit: params?.limit }],
      queryFn: async (
        ctx: QueryFunctionContext<
          readonly ["drafts", "list", { limit?: number }],
          number
        >
      ): Promise<Post[]> => {
        const pageParam = ctx.pageParam ?? 0;
        const limit = params?.limit ?? 10;
        const posts = (await provider.getAllPosts({ offset: pageParam, limit })) as Post[];
        return posts.filter((post) => !post.published);
      },
    }),
  });
}


