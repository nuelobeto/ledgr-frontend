export interface IRegister {
  email: string
  password: string
}

export interface ILogin {
  email: string
  password: string
}

export interface ITwoFactorLogin {
  code: string
}

export interface IForgotPassword {
  email: string
}

export interface IResetPassword {
  userId: string
  token: string
  newPassword: string
}

export interface IMfaVerify {
  code: string
}

// Shared shape for the auth endpoints that just return a status message
// (register, forgot-password, reset-password, logout, mfa/disable...).
export interface IMessageResponse {
  message: string
}

// /api/auth/login — mirrors the branches in app/api/auth/login/route.ts. No tokens ever
// reach the client; that route sets httpOnly cookies itself and only reports which branch fired.
export interface ILoginResponse {
  status: "authenticated" | "mfa_required" | "enrollment_required" | "unknown"
}

// /api/auth/mfa/enroll
export interface IMfaEnrollResponse {
  sharedKey: string
  otpauthUri: string
}

// /api/auth/mfa/verify
export interface IMfaVerifyResponse {
  message: string
  recoveryCodes: string[]
}
