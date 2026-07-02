import { NextRequest, NextResponse } from "next/server"
import { callWithAuth } from "@/lib/api-client"
import { setSessionCookies, clearSessionCookies } from "@/lib/auth-cookies"

export async function POST(req: NextRequest) {
  const body = await req.json() // { code } — step-up: prove the authenticator before rolling codes

  // Bearer-only on the ASP.NET side, same as mfa/disable — no resolveMfaBearer.
  const result = await callWithAuth(req, "/api/auth/mfa/recovery-codes/regenerate", {
    method: "POST",
    data: body,
  })

  const res = NextResponse.json(result.data, { status: result.status })

  if (result.status === 401) clearSessionCookies(res)
  else if (result.refreshed) setSessionCookies(res, result.refreshed)

  return res
}
