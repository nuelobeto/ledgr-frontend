import { NextRequest, NextResponse } from "next/server"

const isProd = process.env.NODE_ENV === "production"

const base = {
  httpOnly: true, // JS can't read it — XSS can't steal the token
  secure: isProd, // HTTPS-only in prod; MUST be false on http://localhost or the browser drops it
  sameSite: "lax" as const,
  path: "/",
}

export function setSessionCookies(
  res: NextResponse,
  tokens: { accessToken: string; refreshToken: string }
) {
  // Align these with your ACTUAL token lifetimes (from TokenService).
  res.cookies.set("access_token", tokens.accessToken, {
    ...base,
    maxAge: 60 * 15,
  }) // ~15 min
  res.cookies.set("refresh_token", tokens.refreshToken, {
    ...base,
    maxAge: 60 * 60 * 24 * 7,
  }) // ~7 days
}

export function clearSessionCookies(res: NextResponse) {
  res.cookies.set("access_token", "", { ...base, maxAge: 0 })
  res.cookies.set("refresh_token", "", { ...base, maxAge: 0 })
}

// enroll/verify on the API side accept EITHER a real session (voluntary MFA setup from
// an already-logged-in user) or an enrollment_token (forced setup, no session yet).
// access_token wins if both somehow exist — a real session should never be shadowed by
// an interstitial cookie.
export function resolveMfaBearer(
  req: NextRequest
): { token: string; source: "access" | "enrollment" } | null {
  const access = req.cookies.get("access_token")?.value
  if (access) return { token: access, source: "access" }

  const enrollment = req.cookies.get("enrollment_token")?.value
  if (enrollment) return { token: enrollment, source: "enrollment" }

  return null
}
