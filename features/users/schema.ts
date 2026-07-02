import * as z from "zod"

// Mirrors LedgrApi's UpdateProfileRequest validation: FirstName/LastName StringLength(100),
// Currency ^[A-Za-z]{3}$ (case-insensitive there, but the Select here only ever offers
// uppercase codes from lib/currencies.ts, so no extra normalization needed client-side).
export const setupSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required.")
    .max(100, "First name is too long."),

  lastName: z.string().min(1, "Last name is required.").max(100, "Last name is too long."),

  currency: z
    .string()
    .min(1, "Please choose a currency.")
    .regex(/^[A-Z]{3}$/, "Please choose a currency."),
})

export type SetupSchemaFormValues = z.infer<typeof setupSchema>
