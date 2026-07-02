import { NextRequest, NextResponse } from "next/server"

const BASE_URL = process.env.BASE_URL!

export async function POST(req: NextRequest) {
  const body = await req.json() // { userId, token, newPassword }

  const upstream = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await upstream.json()

  // userId/token identify the request, not a session — no cookies involved here either.
  return NextResponse.json(data, { status: upstream.status })
}
