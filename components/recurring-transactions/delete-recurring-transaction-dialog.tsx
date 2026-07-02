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
import { useDeleteRecurringTransactionMutation } from "@/features/recurring-transactions/hooks"
import { formatFrequency } from "@/features/recurring-transactions/utils"
import { IRecurringTransaction } from "@/features/recurring-transactions/types"
import { useCurrency } from "@/features/users/hooks"
import { getErrorMessage } from "@/lib/api-error"
import { formatCurrency } from "@/lib/format"

interface DeleteRecurringTransactionDialogProps {
  // Non-null opens the dialog — same controlled-prop pattern as the other confirm dialogs.
  recurring: IRecurringTransaction | null
  onOpenChange: (open: boolean) => void
}

export function DeleteRecurringTransactionDialog({
  recurring,
  onOpenChange,
}: DeleteRecurringTransactionDialogProps) {
  const deleteMutation = useDeleteRecurringTransactionMutation()
  const currency = useCurrency()

  // Remember the last non-null item so the confirmation text doesn't blank out during the
  // dialog's exit animation. Adjusted during render (not an effect) to avoid an extra
  // cascading render — same reasoning as ArchiveCategoryDialog/DeleteTransactionDialog.
  const [lastRecurring, setLastRecurring] = useState<IRecurringTransaction | null>(null)
  if (recurring && recurring !== lastRecurring) {
    setLastRecurring(recurring)
  }

  const handleConfirm = () => {
    if (!recurring) return

    deleteMutation.mutate(recurring.id, {
      onSuccess: () => {
        toast.success("Recurring transaction deleted.")
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Couldn't delete the recurring transaction."))
      },
    })
  }

  return (
    <Dialog open={!!recurring} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete recurring transaction</DialogTitle>
          <DialogDescription>
            {lastRecurring && (
              <>
                Delete this {formatFrequency(lastRecurring.frequency, lastRecurring.interval)
                  .toLowerCase()}{" "}
                {lastRecurring.type === "Income" ? "income" : "expense"} of{" "}
                {formatCurrency(lastRecurring.amount, currency)} in &ldquo;
                {lastRecurring.category.name}&rdquo;? This can&apos;t be undone.
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
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={handleConfirm}
          >
            {deleteMutation.isPending && <Spinner />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
