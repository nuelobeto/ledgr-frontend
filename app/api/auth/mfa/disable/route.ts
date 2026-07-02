import { NextRequest, NextResponse } from "next/server"
import { callWithAuth } from "@/lib/api-client"
import { setSessionCookies, clearSessionCookies } from "@/lib/auth-cookies"

export async function POST(req: NextRequest) {
  const body = await req.json() // { code } — step-up: prove the authenticator before disabling

  // Note: no resolveMfaBearer here. ASP.NET pins this to [Authorize(Bearer)] only — an
  // enrollment_token must never be able to touch existing MFA settings.
  const result = await callWithAuth(req, "/api/auth/mfa/disable", {
    method: "POST",
    data: body,
  })

  const res = NextResponse.json(result.data, { status: result.status })

  if (result.status === 401) clearSessionCookies(res)
  else if (result.refreshed) setSessionCookies(res, result.refreshed)

  return res
}
