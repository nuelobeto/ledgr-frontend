// Mirrors LedgrApi's UserResponse (Dtos/UserDtos.cs).
export interface ICurrentUser {
  id: string
  email: string
  emailConfirmed: boolean
  twoFactorEnabled: boolean
  status: string
  roles: string[]
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  locale: string | null
  timeZoneId: string | null
  currency: string | null
  lastLoginAtUtc: string | null
  createdAtUtc: string
  updatedAtUtc: string
}

// Mirrors LedgrApi's UpdateProfileRequest — all fields optional, PATCH semantics (omit a
// field to leave it as-is; UserController.UpdateMe only touches fields that are non-null here).
export interface IUpdateProfile {
  firstName?: string
  lastName?: string
  avatarUrl?: string
  locale?: string
  timeZoneId?: string
  currency?: string
}
