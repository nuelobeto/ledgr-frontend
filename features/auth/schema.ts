import * as z from "zod"

const emailSchema = z
  .string()
  .min(1, "Email address is required.")
  .email({ message: "Please enter a valid email address." })

export const passwordSchema = z
  .string()
  .min(1, "Password is required.")
  .min(12, "Password must be at least 12 characters long.")
  .max(100, "Password is too long.")
  .regex(/\p{Nd}/u, "Password must contain at least one digit.")
  .regex(/\p{Ll}/u, "Password must contain at least one lowercase letter.")
  .regex(/\p{Lu}/u, "Password must contain at least one uppercase letter.")

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type RegisterSchemaFormValues = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: emailSchema,
  // Login only checks a password was typed — re-running the full policy here would reject
  // pre-policy-change accounts for the wrong reason. The backend's CheckPasswordSignInAsync
  // is the actual source of truth and fails with "Invalid credentials." either way.
  password: z.string().min(1, "Password is required."),
})

export type LoginSchemaFormValues = z.infer<typeof loginSchema>

// Covers both login/2fa and mfa/verify's code field. Accepts either a 6-digit authenticator
// code or a recovery code — ASP.NET tries VerifyTwoFactorTokenAsync first and falls back to
// RedeemTwoFactorRecoveryCodeAsync, so the client shouldn't force a shape the backend itself
// doesn't require.
export const mfaCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Enter your 6-digit code or a recovery code.")
    .max(64, "That code is too long."),
})

export type MfaCodeSchemaFormValues = z.infer<typeof mfaCodeSchema>

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordSchemaFormValues = z.infer<
  typeof forgotPasswordSchema
>

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export type ResetPasswordSchemaFormValues = z.infer<typeof resetPasswordSchema>
