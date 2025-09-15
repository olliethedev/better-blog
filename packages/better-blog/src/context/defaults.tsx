import { PostCard } from "@/components/better-blog/post-card"
import { PostCardSkeleton } from "@/components/better-blog/post-card-skeleton"
import type { AdminPermissions, BlogComponents } from "./types"

export const defaultNavigate = (href: string) => {
    window.location.href = href
}

export const defaultReplace = (href: string) => {
    window.location.replace(href)
}

// Default implementations using standard HTML elements
export const defaultUIComponents: BlogComponents = {
    Link: ({ href, children, className, ...props }) => (
        <a href={href} className={className} {...props}>
            {children}
        </a>
    ),
    Image: ({ src, alt = "", className, width, height, ...props }) => (
        // biome-ignore lint/a11y/useAltText: <explanation>
        <img
            src={src}
            alt={alt || "Image"}
            className={className}
            width={width}
            height={height}
            {...props}
        />
    ),
    PostCard: ({ post }) => <PostCard post={post} />,
    PostCardSkeleton: () => <PostCardSkeleton />
}
export const defaultAdminPermissions: AdminPermissions = {
    canCreate: false,
    canUpdate: false,
    canDelete: false
}
