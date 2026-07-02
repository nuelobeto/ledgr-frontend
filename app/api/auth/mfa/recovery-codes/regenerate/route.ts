import { NextRequest } from "next/server"
import { proxyWithAuth } from "@/lib/api-client"

export async function POST(req: NextRequest) {
  const body = await req.json() // { code } — step-up: prove the authenticator before rolling codes

  // Bearer-only on the ASP.NET side, same as mfa/disable — no resolveMfaBearer.
  return proxyWithAuth(req, "/api/auth/mfa/recovery-codes/regenerate", {
    method: "POST",
    data: body,
  })
}
