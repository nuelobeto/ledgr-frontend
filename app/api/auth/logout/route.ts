import { NextRequest, NextResponse } from "next/server"
import { clearSessionCookies } from "@/lib/auth-cookies"

const BASE_URL = process.env.BASE_URL!

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value

  if (refreshToken) {
    // Best-effort: tell ASP.NET to revoke the refresh family. Don't block logout on it.
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {})
  }

  const res = NextResponse.json({ status: "logged_out" })
  clearSessionCookies(res)
  return res
}
