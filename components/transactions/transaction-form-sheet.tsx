"use client"

import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { CategoryCombobox } from "@/components/categories/category-combobox"
import {
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
} from "@/features/transactions/hooks"
import {
  transactionSchema,
  TransactionSchemaFormValues,
} from "@/features/transactions/schema"
import { ITransaction, ITransactionInput } from "@/features/transactions/types"
import { getErrorMessage } from "@/lib/api-error"

interface TransactionFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Present => edit mode. Null/undefined => create mode — same one-component-both-modes
  // approach as CategoryFormDialog.
  transaction?: ITransaction | null
}

function toFormValues(
  transaction?: ITransaction | null
): TransactionSchemaFormValues {
  return {
    date: transaction?.date ?? new Date().toISOString().slice(0, 10),
    type: transaction?.type ?? "Expense",
    amount: transaction?.amount ?? 0,
    categoryId: transaction?.category.id ?? "",
    notes: transaction?.notes ?? "",
  }
}

export function TransactionFormSheet({
  open,
  onOpenChange,
  transaction,
}: TransactionFormSheetProps) {
  const isEdit = !!transaction
  const createMutation = useCreateTransactionMutation()
  const updateMutation = useUpdateTransactionMutation()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionSchemaFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: toFormValues(),
  })

  // Re-sync on every open (not just when `transaction` changes reference) — same reasoning
  // as CategoryFormDialog: covers reopening "New transaction" after canceling with unsaved
  // input, and switching between rows' edit buttons cleanly.
  useEffect(() => {
    if (open) reset(toFormValues(transaction))
  }, [open, transaction, reset])

  const onSubmit = (values: TransactionSchemaFormValues) => {
    const payload: ITransactionInput = {
      date: values.date,
      type: values.type,
      amount: values.amount,
      categoryId: values.categoryId,
      notes: values.notes?.trim() || undefined,
    }

    if (transaction) {
      updateMutation.mutate(
        { id: transaction.id, payload },
        {
          onSuccess: () => {
            toast.success("Transaction updated.")
            onOpenChange(false)
          },
          onError: (error) => {
            toast.error(
              getErrorMessage(error, "Couldn't update the transaction.")
            )
          },
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Transaction created.")
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(
            getErrorMessage(error, "Couldn't create the transaction.")
          )
        },
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Edit transaction" : "New transaction"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the details for this transaction."
              : "Record a new income or expense."}
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-1 flex-col overflow-y-auto px-4"
        >
          <FieldGroup>
            <Field data-invalid={!!errors.type}>
              <FieldLabel htmlFor="type">Type</FieldLabel>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="type"
                      aria-invalid={!!errors.type}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Expense">Expense</SelectItem>
                      <SelectItem value="Income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.type]} />
            </Field>

            <Field data-invalid={!!errors.amount}>
              <FieldLabel htmlFor="amount">Amount</FieldLabel>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                inputMode="decimal"
                aria-invalid={!!errors.amount}
                {...register("amount", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.amount]} />
            </Field>

            <Field data-invalid={!!errors.date}>
              <FieldLabel htmlFor="date">Date</FieldLabel>
              <Input
                id="date"
                type="date"
                aria-invalid={!!errors.date}
                {...register("date")}
              />
              <FieldError errors={[errors.date]} />
            </Field>

            <Field data-invalid={!!errors.categoryId}>
              <FieldLabel htmlFor="categoryId">Category</FieldLabel>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <CategoryCombobox
                    value={field.value}
                    onChange={field.onChange}
                    invalid={!!errors.categoryId}
                  />
                )}
              />
              <FieldError errors={[errors.categoryId]} />
            </Field>

            <Field data-invalid={!!errors.notes}>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea
                id="notes"
                rows={3}
                aria-invalid={!!errors.notes}
                {...register("notes")}
              />
              <FieldError errors={[errors.notes]} />
            </Field>
          </FieldGroup>

          <SheetFooter className="flex-row justify-end px-0">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />}
              {isEdit ? "Save" : "Create"}
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
