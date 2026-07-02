import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  IRegister,
  ILogin,
  ITwoFactorLogin,
  IForgotPassword,
  IResetPassword,
  IMfaVerify,
  IChangePassword,
} from "./types"
import services from "./services"

// MfaController.Enroll mints a fresh TOTP secret server-side on EVERY call
// (ResetAuthenticatorKeyAsync wipes the previous one) — so this must not silently refetch on
// remount, window focus, or React StrictMode's double-invoke, or a QR code the user already
// scanned goes stale mid-flow. staleTime: Infinity + every refetch trigger off means "fetch
// once for this visit to the page, then hold," matching the one-shot nature of the endpoint.
export const useMfaEnrollQuery = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["auth", "mfa", "enroll"],
    queryFn: () => services.mfaEnroll(),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: options?.enabled,
  })
}

// Mutations
export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (payload: IRegister) => {
      return services.register(payload)
    },
  })
}

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (payload: ILogin) => {
      return services.login(payload)
    },
  })
}

export const useLoginTwoFactorMutation = () => {
  return useMutation({
    mutationFn: (payload: ITwoFactorLogin) => {
      return services.loginTwoFactor(payload)
    },
  })
}

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: IForgotPassword) => {
      return services.forgotPassword(payload)
    },
  })
}

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: IResetPassword) => {
      return services.resetPassword(payload)
    },
  })
}

export const useMfaVerifyMutation = () => {
  return useMutation({
    mutationFn: (payload: IMfaVerify) => {
      return services.mfaVerify(payload)
    },
  })
}

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: IChangePassword) => {
      return services.changePassword(payload)
    },
  })
}

export const useLogoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => services.logout(),
    // Wipe everything, not just ["users","me"] — the next person to use this browser
    // shouldn't see a flash of the previous account's cached data before it refetches.
    onSettled: () => {
      queryClient.clear()
    },
  })
}
