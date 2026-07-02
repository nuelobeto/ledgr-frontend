import { NextRequest, NextResponse } from "next/server"
import { setSessionCookies, clearSessionCookies } from "@/lib/auth-cookies"

const BASE_URL = process.env.BASE_URL!

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value
  if (!refreshToken) {
    return NextResponse.json({ message: "No session." }, { status: 401 })
  }

  const upstream = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  const data = await upstream.json()

  if (!upstream.ok) {
    // Expired, replayed, or the family got revoked server-side (theft detection) — the
    // cookie is dead either way. Clear it so the client stops retrying and falls through
    // to a real re-login instead of looping.
    const res = NextResponse.json(data, { status: upstream.status })
    clearSessionCookies(res)
    return res
  }

  // Rotation: ASP.NET consumed the old refresh_token and issued a new access+refresh pair.
  // Both cookies MUST be overwritten — reusing the old refresh_token again would look like
  // a replay next time and trip the reuse-detection in RefreshTokenService.
  const res = NextResponse.json({ status: "refreshed" })
  setSessionCookies(res, data)
  return res
}
