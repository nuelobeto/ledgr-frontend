import axios, { AxiosRequestConfig } from "axios"
import { NextRequest, NextResponse } from "next/server"
import { setSessionCookies, clearSessionCookies } from "@/lib/auth-cookies"

const BASE_URL = process.env.BASE_URL!

export type ProxyResult<T = unknown> = {
  data: T
  status: number
  // Set only when we had to spend the refresh_token mid-call. The caller MUST pass this to
  // setSessionCookies on the outgoing response — refresh rotation is single-use, so if the
  // new pair never reaches the browser, the NEXT request from this client is dead too.
  refreshed?: { accessToken: string; refreshToken: string }
}

// Calls an ASP.NET endpoint that requires a real session (Bearer access_token). access_token
// only lives JWT_ACCESS_TOKEN_MINUTES (default 15) — if it's expired, ASP.NET returns 401 well
// before the session should actually be considered over. Rather than surface that 401 to the
// client, spend the refresh_token once here and retry the same call transparently.
export async function callWithAuth<T = unknown>(
  req: NextRequest,
  path: string,
  config: AxiosRequestConfig = {}
): Promise<ProxyResult<T>> {
  // validateStatus: true so 401s come back as normal responses to inspect, not thrown errors.
  const client = axios.create({ baseURL: BASE_URL, validateStatus: () => true })

  const attempt = (accessToken?: string) =>
    client.request<T>({
      ...config,
      url: path,
      headers: {
        ...config.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

  const accessToken = req.cookies.get("access_token")?.value
  let res = await attempt(accessToken)

  if (res.status !== 401) return { data: res.data, status: res.status }

  const refreshToken = req.cookies.get("refresh_token")?.value
  if (!refreshToken) return { data: res.data, status: 401 } // never had a session to begin with

  // Hit ASP.NET's refresh directly (not our own /api/auth/refresh route) so the rotated pair
  // comes straight back to us and we can set it on THIS response — bouncing through our own
  // route would rotate the tokens server-side but strand the new Set-Cookie on an internal
  // response the browser never sees.
  const refreshRes = await client.post<{ accessToken: string; refreshToken: string }>(
    "/api/auth/refresh",
    { refreshToken }
  )

  if (refreshRes.status !== 200) return { data: res.data, status: 401 } // refresh_token dead too

  const refreshed = refreshRes.data
  res = await attempt(refreshed.accessToken)

  return { data: res.data, status: res.status, refreshed }
}

// Thin wrapper around callWithAuth for the common case: forward the upstream status/body
// as-is, and apply the same cookie fallout every Bearer-only route needs — clear the session
// on a final 401, or persist the rotated pair if a silent refresh happened mid-call. Route
// handlers that need to inspect/transform the response (e.g. mfa/verify's cookie-on-success
// branch) should keep calling callWithAuth directly instead.
export async function proxyWithAuth<T = unknown>(
  req: NextRequest,
  path: string,
  config: AxiosRequestConfig = {}
): Promise<NextResponse> {
  const result = await callWithAuth<T>(req, path, config)

  const res = NextResponse.json(result.data, { status: result.status })

  if (result.status === 401) clearSessionCookies(res)
  else if (result.refreshed) setSessionCookies(res, result.refreshed)

  return res
}
