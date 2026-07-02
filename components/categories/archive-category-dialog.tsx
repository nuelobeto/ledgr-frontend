"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  useArchiveCategoryMutation,
  useUnarchiveCategoryMutation,
} from "@/features/categories/hooks"
import { ICategory } from "@/features/categories/types"
import { getErrorMessage } from "@/lib/api-error"

interface ArchiveCategoryDialogProps {
  // Non-null opens the dialog. Kept as a controlled prop (rather than its own open state)
  // so the page can hand it whichever row's archive/unarchive button was clicked.
  category: ICategory | null
  onOpenChange: (open: boolean) => void
}

export function ArchiveCategoryDialog({ category, onOpenChange }: ArchiveCategoryDialogProps) {
  const archiveMutation = useArchiveCategoryMutation()
  const unarchiveMutation = useUnarchiveCategoryMutation()

  // Remember the last non-null category so the dialog's text doesn't blank out mid-close —
  // `category` flips to null immediately on confirm/cancel, but Radix keeps the dialog
  // mounted briefly to play the exit animation. Adjusted during render (not an effect) per
  // React's documented pattern, to avoid an extra cascading render.
  const [lastCategory, setLastCategory] = useState<ICategory | null>(null)
  if (category && category !== lastCategory) {
    setLastCategory(category)
  }

  const isArchived = lastCategory?.isArchived ?? false
  const mutation = isArchived ? unarchiveMutation : archiveMutation

  const handleConfirm = () => {
    if (!category) return

    const options = {
      onSuccess: () => {
        toast.success(category.isArchived ? "Category restored." : "Category archived.")
        onOpenChange(false)
      },
      onError: (error: unknown) => {
        toast.error(
          getErrorMessage(
            error,
            category.isArchived
              ? "Couldn't restore the category."
              : "Couldn't archive the category."
          )
        )
      },
    }

    if (category.isArchived) {
      unarchiveMutation.mutate(category.id, options)
    } else {
      archiveMutation.mutate(category.id, options)
    }
  }

  return (
    <Dialog open={!!category} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isArchived ? "Restore category" : "Archive category"}</DialogTitle>
          <DialogDescription>
            {isArchived ? (
              <>Make &ldquo;{lastCategory?.name}&rdquo; available again for new transactions?</>
            ) : (
              <>
                Archive &ldquo;{lastCategory?.name}&rdquo;? It won&apos;t be available when
                creating new transactions, but existing ones keep it.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant={isArchived ? "default" : "destructive"}
            disabled={mutation.isPending}
            onClick={handleConfirm}
          >
            {mutation.isPending && <Spinner />}
            {isArchived ? "Restore" : "Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
