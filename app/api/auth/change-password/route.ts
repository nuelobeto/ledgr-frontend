import { NextRequest, NextResponse } from "next/server"
import { callWithAuth } from "@/lib/api-client"
import { setSessionCookies, clearSessionCookies } from "@/lib/auth-cookies"

export async function POST(req: NextRequest) {
  const body = await req.json() // { currentPassword, newPassword }

  const result = await callWithAuth(req, "/api/auth/change-password", {
    method: "POST",
    data: body,
  })

  const res = NextResponse.json(result.data, { status: result.status })

  // A final 401 here always means "no valid session" (ASP.NET only 401s this route when the
  // token's user lookup fails) — never wrong-password, that's a 400. Safe to clear on sight.
  if (result.status === 401) clearSessionCookies(res)
  else if (result.refreshed) setSessionCookies(res, result.refreshed)

  return res
}
