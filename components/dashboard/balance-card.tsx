"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBalanceQuery } from "@/features/transactions/hooks"
import { useCurrency } from "@/features/users/hooks"
import { formatCurrency } from "@/lib/format"

export function BalanceCard() {
  const balanceQuery = useBalanceQuery()
  const currency = useCurrency()

  return (
    <Card>
      <CardHeader>
        <CardDescription>Current balance</CardDescription>
        {balanceQuery.isPending ? (
          <Skeleton className="h-8 w-32" />
        ) : balanceQuery.isError ? (
          <p className="text-xs text-muted-foreground">Couldn&apos;t load your balance.</p>
        ) : (
          <CardTitle
            className={
              balanceQuery.data.balance < 0
                ? "text-2xl text-destructive"
                : "text-2xl text-primary"
            }
          >
            {formatCurrency(balanceQuery.data.balance, currency)}
          </CardTitle>
        )}
      </CardHeader>
    </Card>
  )
}
