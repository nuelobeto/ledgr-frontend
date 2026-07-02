import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

// Idempotent on the backend — pausing an already-paused rule just returns it unchanged.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyWithAuth(req, `/api/recurring-transactions/${id}/pause`, { method: "POST" })
}
