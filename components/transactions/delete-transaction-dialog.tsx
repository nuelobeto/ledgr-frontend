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
import { useDeleteTransactionMutation } from "@/features/transactions/hooks"
import { ITransaction } from "@/features/transactions/types"
import { useCurrency } from "@/features/users/hooks"
import { getErrorMessage } from "@/lib/api-error"
import { formatCurrency } from "@/lib/format"

interface DeleteTransactionDialogProps {
  // Non-null opens the dialog — same controlled-prop pattern as ArchiveCategoryDialog.
  transaction: ITransaction | null
  onOpenChange: (open: boolean) => void
}

export function DeleteTransactionDialog({
  transaction,
  onOpenChange,
}: DeleteTransactionDialogProps) {
  const deleteMutation = useDeleteTransactionMutation()
  const currency = useCurrency()

  // Remember the last non-null transaction so the confirmation text doesn't blank out during
  // the dialog's exit animation — same reasoning as ArchiveCategoryDialog. Adjusted during
  // render (not an effect) to avoid an extra cascading render.
  const [lastTransaction, setLastTransaction] = useState<ITransaction | null>(null)
  if (transaction && transaction !== lastTransaction) {
    setLastTransaction(transaction)
  }

  const handleConfirm = () => {
    if (!transaction) return

    deleteMutation.mutate(transaction.id, {
      onSuccess: () => {
        toast.success("Transaction deleted.")
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Couldn't delete the transaction."))
      },
    })
  }

  return (
    <Dialog open={!!transaction} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete transaction</DialogTitle>
          <DialogDescription>
            {lastTransaction && (
              <>
                Delete this {lastTransaction.type === "Income" ? "income" : "expense"} of{" "}
                {formatCurrency(lastTransaction.amount, currency)} in &ldquo;
                {lastTransaction.category.name}&rdquo;? This can&apos;t be undone.
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
