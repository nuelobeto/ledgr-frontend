import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

// Query params (page/pageSize/search/archived) pass straight through to
// CategoryController.GetMyCategories untouched.
export async function GET(req: NextRequest) {
  return proxyWithAuth(req, `/api/categories${req.nextUrl.search}`, { method: "GET" })
}
