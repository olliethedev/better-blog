"use client"

import { BetterBlogAttribution } from "@/components/better-blog/better-blog-attribution"
import { useBlogContext } from "@/context/better-blog-context"
import { PageLayout } from "./page-layout"

export function PageWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
    const { showAttribution } = useBlogContext()
    return (
        <>
            <PageLayout className={className}>{children}</PageLayout>

            {showAttribution && <BetterBlogAttribution />}
        </>
    )
}
