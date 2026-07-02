import { cookies } from "next/headers"

// Coarse presence check only — neither cookie proves a still-valid session (access_token
// expires every 15 min; refresh_token could be dead too). Real enforcement is client-side via
// useAuthGuard (features/users/hooks.ts) hitting /api/users/me, which silently refreshes or
// bounces to /auth/login on a genuine 401. This just stops a visitor with zero session
// cookies from ever seeing gated chrome (dashboard, setup) render before that check runs.
export async function hasSessionCookies(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.has("access_token") || cookieStore.has("refresh_token")
}
