"use client"

import { getOrCreateQueryClient } from "@/lib/query-client"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { BlogProvider, type BlogUIComponents } from "better-blog/context"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

const queryClient = getOrCreateQueryClient()

// Next.js components to be used in the blog
const components: BlogUIComponents = {
    Link: ({ href, children, className }) => (
        <Link href={href} className={className}>
            {children}
        </Link>
    ),
    Image: ({ src, alt, className, width, height }) => (
        <Image
            src={src}
            alt={alt}
            className={className}
            width={width || 800}
            height={height || 400}
        />
    )
}

export function Provider({ children }: { children: ReactNode }) {
    const router = useRouter()

    return (
        <QueryClientProvider client={queryClient}>
            <BlogProvider
                localization={{
                    BLOG_LIST_TITLE: "Blog Posts"
                }}
                components={components}
                basePath="/posts"
                adminPermissions={{
                    // implement your own admin ui logic here
                    canCreate: true,
                    canUpdate: true,
                    canDelete: true
                }}
                navigate={router.push}
                replace={router.replace}
                uploadImage={async (file) => {
                    console.log("uploadImage", file)
                    // implement your own image upload logic here
                    return "https://placehold.co/400/png"
                }}
                dataProvider={
                    undefined /* default to API router; SSR uses getProvider */
                }
            >
                {children}
            </BlogProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
