"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/features/categories/hooks"
import { categorySchema, CategorySchemaFormValues } from "@/features/categories/schema"
import { ICategory } from "@/features/categories/types"
import { getErrorMessage } from "@/lib/api-error"

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Present => edit mode. Null/undefined => create mode. One dialog instance handles both,
  // reused across every row's edit button plus the page's "New category" button.
  category?: ICategory | null
}

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const isEdit = !!category
  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategorySchemaFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  })

  // Re-sync on every open rather than relying on prop-reference equality — covers reopening
  // the create dialog after canceling with unsaved text, and switching between rows' edit
  // buttons while cleanly discarding whatever was typed for the previous one.
  useEffect(() => {
    if (open) reset({ name: category?.name ?? "" })
  }, [open, category, reset])

  const onSubmit = (values: CategorySchemaFormValues) => {
    // Branch on `category` directly (not the `isEdit` boolean) so TS narrows it to non-null.
    if (category) {
      updateMutation.mutate(
        { id: category.id, payload: values },
        {
          onSuccess: () => {
            toast.success("Category updated.")
            onOpenChange(false)
          },
          onError: (error) => {
            toast.error(getErrorMessage(error, "Couldn't update the category."))
          },
        }
      )
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Category created.")
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Couldn't create the category."))
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Rename this category."
              : "Categories help you group transactions."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="category-name">Name</FieldLabel>
              <Input
                id="category-name"
                autoFocus
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />}
              {isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
