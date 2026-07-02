"use client"

import { useState } from "react"
import {
  PauseIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeleteRecurringTransactionDialog } from "@/components/recurring-transactions/delete-recurring-transaction-dialog"
import { RecurringTransactionFormSheet } from "@/components/recurring-transactions/recurring-transaction-form-sheet"
import {
  usePauseRecurringTransactionMutation,
  useRecurringTransactionsQuery,
  useResumeRecurringTransactionMutation,
} from "@/features/recurring-transactions/hooks"
import { IRecurringTransaction } from "@/features/recurring-transactions/types"
import { formatFrequency } from "@/features/recurring-transactions/utils"
import { useCurrency } from "@/features/users/hooks"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/api-error"
import { formatDateOnly } from "@/lib/date"
import { formatCurrency } from "@/lib/format"

const PAGE_SIZE = 20

type Tab = "active" | "paused" | "all"

// Unlike categories' `archived` (defaults to false server-side, always filters), this
// endpoint's `isActive` defaults to null — omitting it shows both active and paused together.
// That's the "all" tab below.
function isActiveParam(tab: Tab): boolean | undefined {
  if (tab === "active") return true
  if (tab === "paused") return false
  return undefined
}

export default function RecurringTransactionsPage() {
  const [tab, setTab] = useState<Tab>("active")
  const [searchInput, setSearchInput] = useState("")
  const search = useDebouncedValue(searchInput)
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editingRecurring, setEditingRecurring] =
    useState<IRecurringTransaction | null>(null)
  const [deletingRecurring, setDeletingRecurring] =
    useState<IRecurringTransaction | null>(null)

  // Reset to page 1 whenever a filter changes — adjusted during render (React's documented
  // pattern), not in an effect, to avoid an extra cascading render.
  const [prevQueryKey, setPrevQueryKey] = useState([search, tab])
  if (prevQueryKey[0] !== search || prevQueryKey[1] !== tab) {
    setPrevQueryKey([search, tab])
    setPage(1)
  }

  const currency = useCurrency()

  const recurringQuery = useRecurringTransactionsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    isActive: isActiveParam(tab),
  })
  const pauseMutation = usePauseRecurringTransactionMutation()
  const resumeMutation = useResumeRecurringTransactionMutation()

  const items = recurringQuery.data?.items ?? []
  const totalPages = recurringQuery.data?.totalPages ?? 1

  const openCreate = () => {
    setEditingRecurring(null)
    setFormOpen(true)
  }

  const openEdit = (recurring: IRecurringTransaction) => {
    setEditingRecurring(recurring)
    setFormOpen(true)
  }

  // Direct one-click toggle, no confirmation — unlike delete, pausing/resuming is trivially
  // reversible with the same button, so a confirm dialog would just be friction.
  const handleToggleActive = (recurring: IRecurringTransaction) => {
    const mutation = recurring.isActive ? pauseMutation : resumeMutation

    mutation.mutate(recurring.id, {
      onSuccess: () => {
        toast.success(recurring.isActive ? "Paused." : "Resumed.")
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(error, "Couldn't update this recurring transaction.")
        )
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <InputGroup className="w-48">
            <InputGroupAddon align="inline-start">
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search notes"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </InputGroup>
          <Button onClick={openCreate}>
            <PlusIcon /> New recurring
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Next due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurringQuery.isPending &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {recurringQuery.isSuccess &&
                items.map((recurring) => (
                  <TableRow key={recurring.id}>
                    <TableCell className="font-medium">
                      {recurring.category.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatFrequency(recurring.frequency, recurring.interval)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateOnly(recurring.nextDueDate)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={recurring.isActive ? "default" : "outline"}
                      >
                        {recurring.isActive ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {recurring.notes}
                    </TableCell>
                    <TableCell
                      className={
                        recurring.type === "Income"
                          ? "text-right text-primary tabular-nums"
                          : "text-right text-destructive tabular-nums"
                      }
                    >
                      {recurring.type === "Income" ? "+" : "-"}
                      {formatCurrency(recurring.amount, currency)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit recurring transaction"
                          onClick={() => openEdit(recurring)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={recurring.isActive ? "Pause" : "Resume"}
                          onClick={() => handleToggleActive(recurring)}
                        >
                          {recurring.isActive ? <PauseIcon /> : <PlayIcon />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Delete recurring transaction"
                          onClick={() => setDeletingRecurring(recurring)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {recurringQuery.isError && (
            <Empty className="py-10">
              <EmptyTitle>Couldn&apos;t load recurring transactions</EmptyTitle>
              <EmptyDescription>Please try again.</EmptyDescription>
            </Empty>
          )}

          {recurringQuery.isSuccess && items.length === 0 && (
            <Empty className="py-10">
              <EmptyTitle>
                {search
                  ? "No recurring transactions match your search."
                  : tab === "paused"
                    ? "No paused recurring transactions."
                    : "No recurring transactions yet."}
              </EmptyTitle>
              {!search && tab !== "paused" && (
                <EmptyDescription>
                  Set up a schedule for income or expenses that repeat.
                </EmptyDescription>
              )}
            </Empty>
          )}

          {recurringQuery.isSuccess && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RecurringTransactionFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        recurring={editingRecurring}
      />
      <DeleteRecurringTransactionDialog
        recurring={deletingRecurring}
        onOpenChange={(open) => !open && setDeletingRecurring(null)}
      />
    </div>
  )
}
