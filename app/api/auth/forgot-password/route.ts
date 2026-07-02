import { NextRequest, NextResponse } from "next/server"

const BASE_URL = process.env.BASE_URL!

export async function POST(req: NextRequest) {
  const body = await req.json() // { email }

  const upstream = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await upstream.json()

  // No tokens, no cookies — same anti-enumeration shape as register: the response is
  // deliberately identical whether or not the email exists, straight passthrough.
  return NextResponse.json(data, { status: upstream.status })
}
