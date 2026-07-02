import { NextRequest, NextResponse } from "next/server"

const BASE_URL = process.env.BASE_URL!

export async function POST(req: NextRequest) {
  const body = await req.json() // { email, password }

  const upstream = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await upstream.json()

  // No tokens, no cookies here — register never issues a session (email confirmation
  // + possibly forced MFA enrollment both happen at login, not here). Straight passthrough,
  // including the deliberately generic message on both new and already-registered emails.
  return NextResponse.json(data, { status: upstream.status })
}
