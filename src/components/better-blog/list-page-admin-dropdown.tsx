"use client"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
    useAdminOptions,
    useBetterBlogContext,
    useBlogPath,
    useComponents
} from "@/lib/better-blog/context/better-blog-context"
import { SettingsIcon } from "lucide-react"

export function ListPageAdminDropdown() {
    const { localization } = useBetterBlogContext()
    const { Link } = useComponents()
    const newPostHref = useBlogPath("new")
    const draftPostsHref = useBlogPath("drafts")
    const { canCreate, canUpdate, canDelete } = useAdminOptions()
    const anyAdminOptions = canCreate || canUpdate || canDelete
    if (!anyAdminOptions) return null
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="max-w-max">
                    <span>{localization.BLOG_LIST_MENU_DROPDOWN_LABEL}</span>
                    <SettingsIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {canCreate && (
                    <DropdownMenuItem asChild>
                        <Link href={newPostHref}>
                            {
                                localization.BLOG_LIST_MENU_DROPDOWN_NEW_POST_BUTTON
                            }
                        </Link>
                    </DropdownMenuItem>
                )}
                {(canUpdate || canDelete) && (
                    <DropdownMenuItem asChild>
                        <Link href={draftPostsHref}>
                            {localization.BLOG_LIST_MENU_DROPDOWN_DRAFT_POSTS}
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
