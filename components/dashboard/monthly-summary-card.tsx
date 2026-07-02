"use client"

import { useMemo } from "react"
import { endOfMonth, format, startOfMonth } from "date-fns"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useTransactionsQuery } from "@/features/transactions/hooks"
import { useCurrency } from "@/features/users/hooks"
import { formatCurrency } from "@/lib/format"

const chartConfig = {
  amount: { label: "Spent", color: "var(--chart-1)" },
} satisfies ChartConfig

export function MonthlySummaryCard() {
  const now = new Date()
  const from = format(startOfMonth(now), "yyyy-MM-dd")
  const to = format(endOfMonth(now), "yyyy-MM-dd")

  // pageSize caps at 100 server-side (TransactionController) — fine for typical personal
  // usage in a single month, but these totals aren't exact past that many transactions.
  // A real aggregate endpoint (SUM/GROUP BY in the database) would remove the cap entirely.
  const transactionsQuery = useTransactionsQuery({ from, to, pageSize: 100 })
  const items = transactionsQuery.data?.items
  const currency = useCurrency()

  const { income, expense, chartData } = useMemo(() => {
    let income = 0
    let expense = 0
    const byCategory = new Map<string, number>()

    for (const t of items ?? []) {
      if (t.type === "Income") {
        income += t.amount
      } else {
        expense += t.amount
        byCategory.set(
          t.category.name,
          (byCategory.get(t.category.name) ?? 0) + t.amount
        )
      }
    }

    const chartData = [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }))

    return { income, expense, chartData }
  }, [items])

  return (
    <Card>
      <CardHeader>
        <CardTitle>This month</CardTitle>
        <CardDescription>{format(now, "MMMM yyyy")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {transactionsQuery.isPending ? (
          <Skeleton className="h-40 w-full" />
        ) : transactionsQuery.isError ? (
          <p className="text-xs text-muted-foreground">
            Couldn&apos;t load this month&apos;s activity.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Income</p>
                <p className="text-lg font-medium text-primary tabular-nums">
                  {formatCurrency(income, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expenses</p>
                <p className="text-lg font-medium text-destructive tabular-nums">
                  {formatCurrency(expense, currency)}
                </p>
              </div>
            </div>

            {chartData.length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="aspect-auto w-full"
                // Size by row count, not a fixed height — with barSize capped below, a fixed
                // h-40 forced 1-2 bars to stretch to fill the whole band (that's the "too big"
                // bug). ~32px/row (20px bar + a small gap) keeps bars tightly packed instead
                // of leaving most of each band empty.
                style={{ height: chartData.length * 24 + 16 }}
              >
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ left: 8 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) =>
                          formatCurrency(Number(value), currency)
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="amount"
                    fill="var(--color-amount)"
                    radius={2}
                    barSize={20}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-xs text-muted-foreground">
                No expenses recorded this month.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
