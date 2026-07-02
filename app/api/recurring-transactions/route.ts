import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

// Query params (page/pageSize/search/isActive) pass straight through to
// RecurringTransactionController.GetMyRecurring untouched.
export async function GET(req: NextRequest) {
  return proxyWithAuth(req, `/api/recurring-transactions${req.nextUrl.search}`, {
    method: "GET",
  })
}
