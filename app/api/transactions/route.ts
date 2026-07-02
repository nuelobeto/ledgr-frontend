import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

// Query params (page/pageSize/search/from/to) pass straight through to
// TransactionController.GetMyTransactions untouched.
export async function GET(req: NextRequest) {
  return proxyWithAuth(req, `/api/transactions${req.nextUrl.search}`, { method: "GET" })
}
