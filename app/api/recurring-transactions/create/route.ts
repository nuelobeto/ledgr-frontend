import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

export async function POST(req: NextRequest) {
  const body = await req.json() // { type, amount, categoryId, frequency, interval, nextDueDate, endDate?, notes? }
  return proxyWithAuth(req, "/api/recurring-transactions/create", { method: "POST", data: body })
}
