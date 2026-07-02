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
  useCreateRecurringTransactionMutation,
  useUpdateRecurringTransactionMutation,
} from "@/features/recurring-transactions/hooks"
import {
  recurringTransactionSchema,
  RecurringTransactionSchemaFormValues,
} from "@/features/recurring-transactions/schema"
import {
  IRecurringTransaction,
  IRecurringTransactionInput,
} from "@/features/recurring-transactions/types"
import { getErrorMessage } from "@/lib/api-error"

interface RecurringTransactionFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Present => edit mode. Null/undefined => create mode — same pattern as
  // TransactionFormSheet/CategoryFormDialog.
  recurring?: IRecurringTransaction | null
}

function toFormValues(
  recurring?: IRecurringTransaction | null
): RecurringTransactionSchemaFormValues {
  return {
    type: recurring?.type ?? "Expense",
    amount: recurring?.amount ?? 0,
    categoryId: recurring?.category.id ?? "",
    frequency: recurring?.frequency ?? "Monthly",
    interval: recurring?.interval ?? 1,
    nextDueDate:
      recurring?.nextDueDate ?? new Date().toISOString().slice(0, 10),
    endDate: recurring?.endDate ?? "",
    notes: recurring?.notes ?? "",
  }
}

export function RecurringTransactionFormSheet({
  open,
  onOpenChange,
  recurring,
}: RecurringTransactionFormSheetProps) {
  const isEdit = !!recurring
  const createMutation = useCreateRecurringTransactionMutation()
  const updateMutation = useUpdateRecurringTransactionMutation()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecurringTransactionSchemaFormValues>({
    resolver: zodResolver(recurringTransactionSchema),
    defaultValues: toFormValues(),
  })

  // Re-sync on every open — covers reopening "New recurring transaction" after canceling with
  // unsaved input, and switching between rows' edit buttons cleanly.
  useEffect(() => {
    if (open) reset(toFormValues(recurring))
  }, [open, recurring, reset])

  const onSubmit = (values: RecurringTransactionSchemaFormValues) => {
    const payload: IRecurringTransactionInput = {
      type: values.type,
      amount: values.amount,
      categoryId: values.categoryId,
      frequency: values.frequency,
      interval: values.interval,
      nextDueDate: values.nextDueDate,
      endDate: values.endDate || undefined,
      notes: values.notes?.trim() || undefined,
    }

    if (recurring) {
      // isActive isn't a form field — toggling it is the dedicated Pause/Resume row action's
      // job, not something editing the schedule's details should silently change.
      updateMutation.mutate(
        {
          id: recurring.id,
          payload: { ...payload, isActive: recurring.isActive },
        },
        {
          onSuccess: () => {
            toast.success("Recurring transaction updated.")
            onOpenChange(false)
          },
          onError: (error) => {
            toast.error(
              getErrorMessage(
                error,
                "Couldn't update the recurring transaction."
              )
            )
          },
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Recurring transaction created.")
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(
            getErrorMessage(error, "Couldn't create the recurring transaction.")
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
            {isEdit
              ? "Edit recurring transaction"
              : "New recurring transaction"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the details for this schedule."
              : "Set up an income or expense that repeats on a schedule."}
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

            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.frequency}>
                <FieldLabel htmlFor="frequency">Frequency</FieldLabel>
                <Controller
                  control={control}
                  name="frequency"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="frequency"
                        aria-invalid={!!errors.frequency}
                        className="w-full"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.frequency]} />
              </Field>

              <Field data-invalid={!!errors.interval}>
                <FieldLabel htmlFor="interval">Every</FieldLabel>
                <Input
                  id="interval"
                  type="number"
                  step="1"
                  min="1"
                  inputMode="numeric"
                  aria-invalid={!!errors.interval}
                  {...register("interval", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.interval]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.nextDueDate}>
              <FieldLabel htmlFor="nextDueDate">Next due date</FieldLabel>
              <Input
                id="nextDueDate"
                type="date"
                aria-invalid={!!errors.nextDueDate}
                {...register("nextDueDate")}
              />
              <FieldError errors={[errors.nextDueDate]} />
            </Field>

            <Field data-invalid={!!errors.endDate}>
              <FieldLabel htmlFor="endDate">End date (optional)</FieldLabel>
              <Input
                id="endDate"
                type="date"
                aria-invalid={!!errors.endDate}
                {...register("endDate")}
              />
              <FieldError errors={[errors.endDate]} />
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
