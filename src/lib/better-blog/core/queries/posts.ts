import { createQueryKeys } from "@lukemorales/query-key-factory";
import type { QueryFunctionContext } from "@tanstack/react-query"
import type { BlogDataProvider, Post } from "../types";

export interface PostsListParams {
  tag?: string;
  query?: string;
  limit?: number;
}

export function createPostsQueries(provider: BlogDataProvider) {
  return createQueryKeys("posts", {
    list: (params: PostsListParams | undefined) => ({
      queryKey: [{ tag: params?.tag, query: params?.query, limit: params?.limit }],
      queryFn: async (
        ctx: QueryFunctionContext<
          readonly ["posts", "list", { tag?: string; query?: string; limit?: number }],
          number
        >
      ): Promise<Post[]> => {
        const pageParam = ctx.pageParam ?? 0;
        const limit = params?.limit ?? 10;
        return await provider.getAllPosts({
          tag: params?.tag,
          query: params?.query,
          offset: pageParam,
          limit,
        });
      },
    }),

    detail: (slug: string) => ({
      queryKey: ["detail", slug],
      queryFn: async (
        _ctx: QueryFunctionContext<readonly ["posts", "detail", string]>
      ): Promise<Post | null> => {
        if (!slug) return null;
        const post = await provider.getPostBySlug?.(slug);
        if (post) return post;
        const posts = await provider.getAllPosts({ slug });
        return posts.find((p) => p.slug === slug) ?? null;
      },
    }),
  });
}


