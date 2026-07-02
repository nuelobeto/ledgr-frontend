import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import services from "./services"
import { ICurrentUser, IUpdateProfile } from "./types"

// Doubles as the client-side auth check for the dashboard shell: /api/users/me already does
// a silent refresh-and-retry (see lib/api-client.ts), so a 401 that surfaces here means the
// session is genuinely dead, not just an expired access_token. retry: false because retrying
// a real 401 won't fix it — callers redirect to /auth/login on isError (see useAuthGuard below).
export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: () => services.getMe(),
    retry: false,
  })
}

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: IUpdateProfile) => services.updateMe(payload),
    // Write the response straight into the cache instead of invalidating — UserController.
    // UpdateMe returns the full updated user, so this is immediate and skips a round trip.
    // Matters here specifically because useAuthGuard reads this same cache entry right after
    // setup submits, to decide whether to stop redirecting to /setup.
    onSuccess: (data) => {
      queryClient.setQueryData(["users", "me"], data)
    },
  })
}

function needsSetup(user: ICurrentUser): boolean {
  return !user.firstName || !user.lastName || !user.currency
}

// Every dashboard route sits behind useAuthGuard (via DashboardHeader), which already
// redirects to /setup when currency is unset — so in practice this cache entry always has
// one by the time a widget reads it. The "USD" fallback only covers the brief window before
// that redirect fires (or a component rendering outside the guard entirely), not the normal
// path — don't take it as the app's real default currency.
export function useCurrency(): string {
  const { data } = useCurrentUserQuery()
  return data?.currency ?? "USD"
}

// Mandatory onboarding gate, same idea as forced MFA enrollment: a real session isn't enough
// to use the dashboard, the profile has to be complete too. Redirects to /auth/login on a
// genuine 401, or to /setup if firstName/lastName/currency are still unset. Call this instead
// of useCurrentUserQuery directly anywhere that should enforce both checks (currently just
// DashboardHeader, since every (app) route renders through it).
export function useAuthGuard() {
  const router = useRouter()
  const query = useCurrentUserQuery()

  useEffect(() => {
    if (query.isError) {
      router.replace("/auth/login")
      return
    }

    if (query.data && needsSetup(query.data)) {
      router.replace("/setup")
    }
  }, [query.isError, query.data, router])

  return query
}
