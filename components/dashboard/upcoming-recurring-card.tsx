"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useRecurringTransactionsQuery } from "@/features/recurring-transactions/hooks"
import { formatFrequency } from "@/features/recurring-transactions/utils"
import { useCurrency } from "@/features/users/hooks"
import { formatDateOnly } from "@/lib/date"
import { formatCurrency } from "@/lib/format"

export function UpcomingRecurringCard() {
  // Already ordered soonest-due-first server-side (RecurringTransactionController.GetMyRecurring).
  const recurringQuery = useRecurringTransactionsQuery({ isActive: true, pageSize: 5 })
  const items = recurringQuery.data?.items ?? []
  const currency = useCurrency()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming recurring</CardTitle>
        <CardDescription>Soonest due first.</CardDescription>
        <CardAction>
          <Button asChild variant="outline" size="sm">
            <Link href="/recurring">View all</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {recurringQuery.isPending && (
          <>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </>
        )}

        {recurringQuery.isError && (
          <p className="text-xs text-muted-foreground">
            Couldn&apos;t load recurring transactions.
          </p>
        )}

        {recurringQuery.isSuccess && items.length === 0 && (
          <p className="text-xs text-muted-foreground">No active recurring transactions.</p>
        )}

        {items.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-medium">{r.category.name}</span>
              <span className="truncate text-muted-foreground">
                Due {formatDateOnly(r.nextDueDate)} · {formatFrequency(r.frequency, r.interval)}
              </span>
            </div>
            <span
              className={
                r.type === "Income"
                  ? "shrink-0 text-primary tabular-nums"
                  : "shrink-0 text-destructive tabular-nums"
              }
            >
              {r.type === "Income" ? "+" : "-"}
              {formatCurrency(r.amount, currency)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
