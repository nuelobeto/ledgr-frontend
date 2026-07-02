import { NextRequest, NextResponse } from "next/server"
import { setSessionCookies } from "@/lib/auth-cookies"

const BASE_URL = process.env.BASE_URL!

export async function POST(req: NextRequest) {
  const mfaToken = req.cookies.get("mfa_token")?.value
  if (!mfaToken)
    return NextResponse.json(
      { message: "MFA session expired. Log in again." },
      { status: 401 }
    )

  const { code } = await req.json()

  const upstream = await fetch(`${BASE_URL}/api/auth/login/2fa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mfaToken, code }),
  })

  const data = await upstream.json()
  if (!upstream.ok) return NextResponse.json(data, { status: upstream.status })

  const res = NextResponse.json({ status: "authenticated" })
  setSessionCookies(res, data)
  res.cookies.set("mfa_token", "", { path: "/", maxAge: 0 }) // consume it
  return res
}
