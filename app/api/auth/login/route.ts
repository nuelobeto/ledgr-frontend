import { NextRequest, NextResponse } from "next/server"
import { setSessionCookies } from "@/lib/auth-cookies"

const BASE_URL = process.env.BASE_URL!
const isProd = process.env.NODE_ENV === "production"

export async function POST(req: NextRequest) {
  const body = await req.json() // { email, password }

  const upstream = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await upstream.json()

  // Pass ASP.NET's error + status straight through (401, 429 rate-limit, etc.)
  if (!upstream.ok) return NextResponse.json(data, { status: upstream.status })

  // 1. Full session issued → set httpOnly cookies, tell the client it's in.
  if (data.accessToken && data.refreshToken) {
    const res = NextResponse.json({ status: "authenticated" })
    setSessionCookies(res, data)
    return res
  }

  // 2. MFA challenge → stash the short-lived challenge token in its own httpOnly
  //    cookie (NOT the session), so the 2FA route can read it. Never hand it to JS.
  if (data.mfaRequired) {
    const res = NextResponse.json({ status: "mfa_required" })
    res.cookies.set("mfa_token", data.mfaToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 5, // matches your 5-minute challenge window
    })
    return res
  }

  // 3. Forced enrollment → same idea, different interstitial token.
  if (data.enrollmentRequired) {
    const res = NextResponse.json({ status: "enrollment_required" })
    res.cookies.set("enrollment_token", data.enrollmentToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    })
    return res
  }

  return NextResponse.json({ status: "unknown" }, { status: 502 })
}
