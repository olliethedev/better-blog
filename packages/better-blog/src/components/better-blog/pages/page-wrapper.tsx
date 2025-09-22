"use client"

import { BetterBlogAttribution } from "@/components/better-blog/better-blog-attribution"
import { useBlogContext } from "@/hooks/context-hooks"
import { PageLayout } from "./page-layout"

export function PageWrapper({
    children,
    className,
    testId
}: { children: React.ReactNode; className?: string; testId?: string }) {
    const { showAttribution } = useBlogContext()
    return (
        <>
            <PageLayout className={className} data-testid={testId}>
                {children}
            </PageLayout>

            {showAttribution && <BetterBlogAttribution />}
        </>
    )
}
