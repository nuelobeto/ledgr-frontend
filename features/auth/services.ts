import axios from "axios"
import {
  IRegister,
  ILogin,
  ITwoFactorLogin,
  IForgotPassword,
  IResetPassword,
  IMfaVerify,
  IChangePassword,
  IMessageResponse,
  ILoginResponse,
  IMfaEnrollResponse,
  IMfaVerifyResponse,
} from "./types"

// These call OUR OWN Next.js API routes (same-origin), never the ASP.NET API directly —
// the browser never learns BASE_URL and never handles a token. Relative paths are enough,
// no base client needed here (contrast with lib/api-client.ts, which is server-only).

const register = async (payload: IRegister) => {
  const { data } = await axios.post<IMessageResponse>("/api/auth/register", payload)
  return data
}

const login = async (payload: ILogin) => {
  const { data } = await axios.post<ILoginResponse>("/api/auth/login", payload)
  return data
}

const loginTwoFactor = async (payload: ITwoFactorLogin) => {
  const { data } = await axios.post<ILoginResponse>("/api/auth/login/2fa", payload)
  return data
}

const forgotPassword = async (payload: IForgotPassword) => {
  const { data } = await axios.post<IMessageResponse>("/api/auth/forgot-password", payload)
  return data
}

const resetPassword = async (payload: IResetPassword) => {
  const { data } = await axios.post<IMessageResponse>("/api/auth/reset-password", payload)
  return data
}

// Non-idempotent on the backend — MfaController.Enroll calls ResetAuthenticatorKeyAsync on
// every hit, minting a fresh secret each time. See useMfaEnrollQuery for why this is only
// ever fired once per visit.
const mfaEnroll = async () => {
  const { data } = await axios.post<IMfaEnrollResponse>("/api/auth/mfa/enroll")
  return data
}

const mfaVerify = async (payload: IMfaVerify) => {
  const { data } = await axios.post<IMfaVerifyResponse>("/api/auth/mfa/verify", payload)
  return data
}

const logout = async () => {
  const { data } = await axios.post<IMessageResponse>("/api/auth/logout")
  return data
}

const changePassword = async (payload: IChangePassword) => {
  const { data } = await axios.post<IMessageResponse>("/api/auth/change-password", payload)
  return data
}

const services = {
  register,
  login,
  loginTwoFactor,
  forgotPassword,
  resetPassword,
  mfaEnroll,
  mfaVerify,
  logout,
  changePassword,
}

export default services
