import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

export async function GET(req: NextRequest) {
  return proxyWithAuth(req, "/api/transactions/balance", { method: "GET" })
}
