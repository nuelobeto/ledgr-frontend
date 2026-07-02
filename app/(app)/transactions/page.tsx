"use client"

import { useState } from "react"
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
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
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog"
import { TransactionFormSheet } from "@/components/transactions/transaction-form-sheet"
import { useTransactionsQuery } from "@/features/transactions/hooks"
import { ITransaction } from "@/features/transactions/types"
import { useCurrency } from "@/features/users/hooks"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatDateOnly } from "@/lib/date"
import { formatCurrency } from "@/lib/format"

const PAGE_SIZE = 20

export default function TransactionsPage() {
  const [searchInput, setSearchInput] = useState("")
  const search = useDebouncedValue(searchInput)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<ITransaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] =
    useState<ITransaction | null>(null)

  // Reset to page 1 whenever a filter changes — adjusted during render (React's documented
  // pattern), not in an effect, to avoid an extra cascading render.
  const [prevQueryKey, setPrevQueryKey] = useState([search, from, to])
  if (
    prevQueryKey[0] !== search ||
    prevQueryKey[1] !== from ||
    prevQueryKey[2] !== to
  ) {
    setPrevQueryKey([search, from, to])
    setPage(1)
  }

  const currency = useCurrency()

  const transactionsQuery = useTransactionsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    from: from || undefined,
    to: to || undefined,
  })

  const items = transactionsQuery.data?.items ?? []
  const totalPages = transactionsQuery.data?.totalPages ?? 1
  const hasFilters = !!(search || from || to)

  const openCreate = () => {
    setEditingTransaction(null)
    setFormOpen(true)
  }

  const openEdit = (transaction: ITransaction) => {
    setEditingTransaction(transaction)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-2">
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
          <Input
            type="date"
            aria-label="From date"
            className="w-36"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            type="date"
            aria-label="To date"
            className="w-36"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <Button onClick={openCreate}>
          <PlusIcon /> New transaction
        </Button>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsQuery.isPending &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {transactionsQuery.isSuccess &&
                items.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDateOnly(tx.date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {tx.category.name}
                    </TableCell>
                    <TableCell className="max-w-64 truncate text-muted-foreground">
                      {tx.notes || "—"}
                    </TableCell>
                    <TableCell
                      className={
                        tx.type === "Income"
                          ? "text-right text-primary tabular-nums"
                          : "text-right text-destructive tabular-nums"
                      }
                    >
                      {tx.type === "Income" ? "+" : "-"}
                      {formatCurrency(tx.amount, currency)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit transaction"
                          onClick={() => openEdit(tx)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Delete transaction"
                          onClick={() => setDeletingTransaction(tx)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {transactionsQuery.isError && (
            <Empty className="py-10">
              <EmptyTitle>Couldn&apos;t load transactions</EmptyTitle>
              <EmptyDescription>Please try again.</EmptyDescription>
            </Empty>
          )}

          {transactionsQuery.isSuccess && items.length === 0 && (
            <Empty className="py-10">
              <EmptyTitle>
                {hasFilters
                  ? "No transactions match your filters."
                  : "No transactions yet."}
              </EmptyTitle>
              {!hasFilters && (
                <EmptyDescription>
                  Record your first income or expense.
                </EmptyDescription>
              )}
            </Empty>
          )}

          {transactionsQuery.isSuccess && totalPages > 1 && (
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

      <TransactionFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        transaction={editingTransaction}
      />
      <DeleteTransactionDialog
        transaction={deletingTransaction}
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
      />
    </div>
  )
}
