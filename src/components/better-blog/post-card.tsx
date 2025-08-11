"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ImageIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import type { Post } from "@/lib/better-blog/core/types";
import { useAdminUiOptions, useBlogPath, useComponents } from "@/lib/better-blog/context/better-blog-context";

export function PostCard({
    post,
    canEdit,
  }: {
    post: Post;
    canEdit?: boolean;
  }) {
    const { Link, Image } = useComponents();
    const { canUpdate } = useAdminUiOptions();
    const blogPath = useBlogPath;
    const canEditResolved = canEdit ?? canUpdate;
    const publishedDate = post.publishedAt || post.createdAt;
  
    return (
      <Card className="group relative flex h-full flex-col gap-2 pt-0 pb-4 transition-shadow duration-200 hover:shadow-lg">
        {/* Featured Image or Placeholder */}
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-muted">
          {post.image &&  (
            <Image
              src={post.image}
              alt={post.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
              width={500}
              height={300}
            />
          ) }
        </div>
  
        {!post.published && (
          <Badge variant="destructive" className="text-xs absolute top-2 left-2">
            Draft
          </Badge>
        )}
  
        <CardHeader className="flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <CalendarIcon className="w-3 h-3" />
            <time dateTime={publishedDate?.toISOString()}>
              {formatDistanceToNow(publishedDate || new Date(), {
                addSuffix: true,
              })}
            </time>
          </div>
  
          <CardTitle className="line-clamp-2 transition-colors text-lg leading-tight">
            <Link href={blogPath(post.slug)} className="hover:underline">
              {post.title}
            </Link>
          </CardTitle>
        </CardHeader>
  
        <CardContent className="flex-1 flex flex-col gap-4">
          {post.excerpt && (
            <CardDescription className="line-clamp-3 mt-2">
              {post.excerpt}
            </CardDescription>
          )}
        </CardContent>
  
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="sm" asChild>
              <Link href={blogPath(post.slug)}>
                Read more
                <ArrowRightIcon className="w-3 h-3 ml-1" />
              </Link>
            </Button>
            {canEditResolved && (
              <Button size="sm" asChild>
                <Link href={blogPath(post.slug, 'edit')}>
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  }

  export function PostCardSkeleton() {
    return (
      <Card className="h-full">
          <div className="relative h-48 w-full">
            <Skeleton className="w-full h-full rounded-t-xl" />
          </div>
          <CardHeader>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-32" />
          </CardContent>
          <CardFooter>
            <div className="flex items-center justify-between w-full">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardFooter>
        </Card>
    );
  }