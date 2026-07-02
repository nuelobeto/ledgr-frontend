import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json() // { name }
  return proxyWithAuth(req, `/api/categories/${id}`, { method: "PATCH", data: body })
}
