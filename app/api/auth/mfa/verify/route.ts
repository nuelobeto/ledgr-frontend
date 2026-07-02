import { NextRequest, NextResponse } from "next/server"
import { setSessionCookies, resolveMfaBearer } from "@/lib/auth-cookies"

const BASE_URL = process.env.BASE_URL!

export async function POST(req: NextRequest) {
  // Two callers land here: a logged-in user finishing voluntary MFA setup (access_token),
  // or a forced-enrollment user with no session yet (enrollment_token). Same endpoint,
  // ASP.NET tells the two apart by the "purpose" claim on whichever token validated.
  const bearer = resolveMfaBearer(req)
  if (!bearer)
    return NextResponse.json(
      { message: "Session expired. Log in again." },
      { status: 401 }
    )

  const { code } = await req.json()

  const upstream = await fetch(`${BASE_URL}/api/auth/mfa/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer.token}`, // enrollment or access token as bearer, NOT body
    },
    body: JSON.stringify({ code }),
  })

  const data = await upstream.json()
  if (!upstream.ok) return NextResponse.json(data, { status: upstream.status })

  // Recovery codes pass THROUGH to the browser (user must save them).
  const res = NextResponse.json({
    message: data.message,
    recoveryCodes: data.recoveryCodes,
  })

  // Tokens are only present on the forced-enrollment branch (no prior session to keep).
  if (data.accessToken && data.refreshToken) {
    setSessionCookies(res, data)
  }

  // enrollment_token is single-use interstitial state — consume it once spent. A voluntary
  // verify (access_token bearer) has no enrollment_token to clear; leave the real session alone.
  if (bearer.source === "enrollment") {
    res.cookies.set("enrollment_token", "", { path: "/", maxAge: 0 })
  }

  return res
}
