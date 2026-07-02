import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

// Same 200-or-204-idempotent shape as archive — see that route's comment.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyWithAuth(req, `/api/categories/${id}/unarchive`, { method: "POST" })
}
