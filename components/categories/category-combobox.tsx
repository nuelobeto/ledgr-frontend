"use client"

import { useState } from "react"
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCategoriesQuery, useCreateCategoryMutation } from "@/features/categories/hooks"
import { ICategory } from "@/features/categories/types"
import { getErrorMessage } from "@/lib/api-error"
import { cn } from "@/lib/utils"

interface CategoryComboboxProps {
  value: string
  onChange: (categoryId: string) => void
  invalid?: boolean
  disabled?: boolean
}

// Plain Popover + Command (cmdk), fully self-managed. Previously built on @base-ui/react's
// Combobox primitive, but its controlled inputValue/value interaction left the trigger
// looking empty right after picking something (clearing the search query on select also wiped
// the displayed label, since that primitive shows the live input text rather than a separate
// "selected label"). This sidesteps that class of bug entirely — the trigger button's label
// comes straight from `selected`, never from the search input's text.
export function CategoryCombobox({ value, onChange, invalid, disabled }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  // A category created mid-form isn't in this list until the invalidated query refetches —
  // keep it around so the trigger doesn't flash back to "Select a category" after picking it.
  const [pendingCategory, setPendingCategory] = useState<ICategory | null>(null)

  // Only active categories can be assigned — matches CreateTransaction/UpdateTransaction's
  // own `!c.IsArchived` check server-side.
  const categoriesQuery = useCategoriesQuery({ pageSize: 100, archived: false })
  const createCategoryMutation = useCreateCategoryMutation()

  const fetchedCategories = categoriesQuery.data?.items ?? []
  const categories =
    pendingCategory && !fetchedCategories.some((c) => c.id === pendingCategory.id)
      ? [...fetchedCategories, pendingCategory]
      : fetchedCategories

  const selected = categories.find((c) => c.id === value) ?? null

  const trimmed = query.trim()
  const filtered = trimmed
    ? categories.filter((c) => c.name.toLowerCase().includes(trimmed.toLowerCase()))
    : categories
  const exactMatch = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())

  const resetAndClose = () => {
    setQuery("")
    setOpen(false)
  }

  const handleSelect = (category: ICategory) => {
    onChange(category.id)
    resetAndClose()
  }

  const handleCreate = () => {
    if (!trimmed || createCategoryMutation.isPending) return

    createCategoryMutation.mutate(
      { name: trimmed },
      {
        onSuccess: (newCategory) => {
          setPendingCategory(newCategory)
          onChange(newCategory.id)
          toast.success(`Category "${newCategory.name}" created.`)
          resetAndClose()
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Couldn't create the category."))
        },
      }
    )
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={invalid}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.name : "Select or create a category"}
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search categories..."
            value={query}
            onValueChange={setQuery}
            disabled={createCategoryMutation.isPending}
          />
          <CommandList>
            <CommandEmpty>No categories yet.</CommandEmpty>
            <CommandGroup>
              {filtered.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.id}
                  onSelect={() => handleSelect(category)}
                >
                  <CheckIcon
                    className={cn(
                      "size-4",
                      category.id === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
              {trimmed && !exactMatch && (
                <CommandItem value={`create:${trimmed}`} onSelect={handleCreate}>
                  <PlusIcon className="size-4" />
                  Create &ldquo;{trimmed}&rdquo;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
