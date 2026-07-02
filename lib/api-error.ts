import { isAxiosError } from "axios"

// ASP.NET doesn't return one consistent error shape across the auth endpoints:
//  - most:              { message: "..." }
//  - reset-password:     { errors: ["...", "..."] }
//  - register (weak pw): ["...", "..."]                <- bare array, no wrapper
//  - model validation:    { errors: { Field: ["...", "..."] } }  (ValidationProblemDetails)
// This normalizes all of them into one string for display.
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!isAxiosError(error)) return fallback

  const data: unknown = error.response?.data

  if (Array.isArray(data)) {
    return data.filter((d): d is string => typeof d === "string").join(" ") || fallback
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>

    if (typeof record.message === "string") return record.message

    if (Array.isArray(record.errors)) {
      return (record.errors as unknown[])
        .filter((e): e is string => typeof e === "string")
        .join(" ")
    }

    if (record.errors && typeof record.errors === "object") {
      return Object.values(record.errors as Record<string, unknown>)
        .flat()
        .filter((e): e is string => typeof e === "string")
        .join(" ")
    }
  }

  return fallback
}
