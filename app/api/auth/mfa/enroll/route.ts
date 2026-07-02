import { NextRequest, NextResponse } from "next/server"
import { resolveMfaBearer } from "@/lib/auth-cookies"

const BASE_URL = process.env.BASE_URL!

export async function POST(req: NextRequest) {
  const bearer = resolveMfaBearer(req)
  if (!bearer)
    return NextResponse.json(
      { message: "Log in before setting up an authenticator." },
      { status: 401 }
    )

  const upstream = await fetch(`${BASE_URL}/api/auth/mfa/enroll`, {
    method: "POST",
    headers: { Authorization: `Bearer ${bearer.token}` },
  })

  const data = await upstream.json()
  if (!upstream.ok) return NextResponse.json(data, { status: upstream.status })

  // sharedKey/otpauthUri aren't a credential (nothing works until it's confirmed via
  // /mfa/verify) — fine to hand straight to the client to render the QR code.
  return NextResponse.json(data)
}
