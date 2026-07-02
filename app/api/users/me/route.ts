import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

// UserController.Me/UpdateMe are [Authorize] (Bearer-only) — same shape as change-password/
// mfa-disable: forward access_token, silently refresh-and-retry once on a 401, and only
// actually treat it as "logged out" if the retry fails too.
export async function GET(req: NextRequest) {
  return proxyWithAuth(req, "/api/users/me", { method: "GET" })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json() // { firstName?, lastName?, avatarUrl?, locale?, timeZoneId?, currency? }

  return proxyWithAuth(req, "/api/users/me", { method: "PATCH", data: body })
}
