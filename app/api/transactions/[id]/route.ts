import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json() // { date, type, amount, categoryId, notes? }
  return proxyWithAuth(req, `/api/transactions/${id}`, { method: "PUT", data: body })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyWithAuth(req, `/api/transactions/${id}`, { method: "DELETE" })
}
