import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

export async function POST(req: NextRequest) {
  const body = await req.json() // { currentPassword, newPassword }

  // A final 401 here always means "no valid session" (ASP.NET only 401s this route when the
  // token's user lookup fails) — never wrong-password, that's a 400. proxyWithAuth clears
  // cookies on any 401, which is exactly right for this route.
  return proxyWithAuth(req, "/api/auth/change-password", { method: "POST", data: body })
}
