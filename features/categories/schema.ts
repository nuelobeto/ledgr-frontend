import * as z from "zod"

// Mirrors CategoryController's validation: [Required] Name, no explicit length cap server-side
// beyond what Postgres' text column allows — 100 is just a sane UI limit.
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required.").max(100, "Name is too long."),
})

export type CategorySchemaFormValues = z.infer<typeof categorySchema>
