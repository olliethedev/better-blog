import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useDeletePost } from "@/hooks"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type EditPostActionsProps = {
    postSlug: string
    onSuccess: () => void
}

export function EditPostActions({ postSlug, onSuccess }: EditPostActionsProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const {
        mutateAsync: deletePost,
        isPending: isDeletingPost,
        error: deletePostError
    } = useDeletePost()

    const handleDeletePost = async () => {
        try {
            await deletePost(postSlug)
            toast.success("Post deleted successfully")
            onSuccess()
            setDeleteDialogOpen(false)
        } catch (error) {
            toast.error("Failed to delete post")
            console.error("Failed to delete post:", error)
        }
    }

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <span>Actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Alert Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the post and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {deletePostError && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-600 text-sm">
                            {deletePostError.message ||
                                "Failed to delete post. Please try again."}
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingPost}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeletePost}
                            disabled={isDeletingPost}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeletingPost ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
