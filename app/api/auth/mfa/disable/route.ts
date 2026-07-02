import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

export async function POST(req: NextRequest) {
  const body = await req.json() // { code } — step-up: prove the authenticator before disabling

  // Note: no resolveMfaBearer here. ASP.NET pins this to [Authorize(Bearer)] only — an
  // enrollment_token must never be able to touch existing MFA settings.
  return proxyWithAuth(req, "/api/auth/mfa/disable", { method: "POST", data: body })
}
