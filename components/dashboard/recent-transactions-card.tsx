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
import { useTransactionsQuery } from "@/features/transactions/hooks"
import { useCurrency } from "@/features/users/hooks"
import { formatDateOnly } from "@/lib/date"
import { formatCurrency } from "@/lib/format"

export function RecentTransactionsCard() {
  // Default order (Date desc, then CreatedAtUtc desc) is exactly "most recent first" —
  // no query params needed beyond capping the page size.
  const transactionsQuery = useTransactionsQuery({ pageSize: 5 })
  const items = transactionsQuery.data?.items ?? []
  const currency = useCurrency()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent transactions</CardTitle>
        <CardDescription>Your last 5 entries.</CardDescription>
        <CardAction>
          <Button asChild variant="outline" size="sm">
            <Link href="/transactions">View all</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {transactionsQuery.isPending && (
          <>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </>
        )}

        {transactionsQuery.isError && (
          <p className="text-xs text-muted-foreground">Couldn&apos;t load transactions.</p>
        )}

        {transactionsQuery.isSuccess && items.length === 0 && (
          <p className="text-xs text-muted-foreground">No transactions yet.</p>
        )}

        {items.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-medium">{tx.category.name}</span>
              <span className="truncate text-muted-foreground">
                {formatDateOnly(tx.date)}
                {tx.notes ? ` · ${tx.notes}` : ""}
              </span>
            </div>
            <span
              className={
                tx.type === "Income"
                  ? "shrink-0 text-primary tabular-nums"
                  : "shrink-0 text-destructive tabular-nums"
              }
            >
              {tx.type === "Income" ? "+" : "-"}
              {formatCurrency(tx.amount, currency)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
