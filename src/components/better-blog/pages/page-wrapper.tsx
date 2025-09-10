"use client"

import { BetterBlogAttribution } from "@/components/better-blog/better-blog-attribution"
import { useBetterBlogContext } from "@/lib/better-blog/context/better-blog-context"
import { cn } from "../../../lib/utils"

export function PageWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
    const { showAttribution } = useBetterBlogContext()
    return (
        <>
            <div className={cn("container mx-auto flex min-h-dvh flex-col items-center gap-16 px-4 py-24 lg:px-16", className)}>
                {children}
            </div>

            {showAttribution && <BetterBlogAttribution />}
        </>
    )
}
