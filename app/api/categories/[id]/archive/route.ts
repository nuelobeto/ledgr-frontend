import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

// ArchiveCategory returns 200 with the category, OR 204 (no body) if it was already archived
// — idempotent no-op. Either way this just forwards the upstream status/body as-is.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyWithAuth(req, `/api/categories/${id}/archive`, { method: "POST" })
}
