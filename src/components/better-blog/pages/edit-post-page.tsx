"use client";

import { useBetterBlogContext } from "../../../lib/better-blog/context/better-blog-context"
import { useRoute } from "../../../lib/better-blog/context/route-context";
import { usePost } from "../../../lib/better-blog/hooks";
import { EmptyList } from "../empty-list"
import { EditPostForm } from "../forms/post-forms"
import { PostLoading } from "../loading";
import { PageHeader } from "../page-header"
import { PageWrapper } from "./page-wrapper"

export function EditPostPageComponent() {
  const { routeMatch } = useRoute();
  const { post, isLoading, error } = usePost(routeMatch.params?.slug);
  const { localization } = useBetterBlogContext()

  if (isLoading) return <PostLoading />;

  if (error || !post) {
    return <EmptyList message={localization.POST_NOT_FOUND_DESCRIPTION} />
  }

  return (
    <PageWrapper className="gap-6">
        <PageHeader
            title={localization.BLOG_POST_EDIT_TITLE}
            description={localization.BLOG_POST_EDIT_DESCRIPTION}
        />
        <EditPostForm
            postSlug={post.slug}
            onClose={() => {}}
            onSuccess={() => {}}
        />
    </PageWrapper>
)
}


