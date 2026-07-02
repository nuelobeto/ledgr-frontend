import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

export async function POST(req: NextRequest) {
  const body = await req.json() // { name }
  return proxyWithAuth(req, "/api/categories/create", { method: "POST", data: body })
}
