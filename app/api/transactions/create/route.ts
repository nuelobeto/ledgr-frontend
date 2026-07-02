import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

export async function POST(req: NextRequest) {
  const body = await req.json() // { date, type, amount, categoryId, notes? }
  return proxyWithAuth(req, "/api/transactions/create", { method: "POST", data: body })
}
