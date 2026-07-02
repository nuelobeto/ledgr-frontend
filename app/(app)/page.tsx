import { BalanceCard } from "@/components/dashboard/balance-card"
import { MonthlySummaryCard } from "@/components/dashboard/monthly-summary-card"
import { RecentTransactionsCard } from "@/components/dashboard/recent-transactions-card"
import { UpcomingRecurringCard } from "@/components/dashboard/upcoming-recurring-card"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BalanceCard />
        <div className="lg:col-span-2">
          <MonthlySummaryCard />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentTransactionsCard />
        <UpcomingRecurringCard />
      </div>
    </div>
  )
}
