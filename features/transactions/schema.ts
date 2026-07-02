import * as z from "zod"

// Mirrors LedgrApi's CreateTransactionRequest/UpdateTransactionRequest validation:
// [Required] Date/Type/CategoryId, [Range(0.01, double.MaxValue)] Amount.
export const transactionSchema = z.object({
  date: z.string().min(1, "Date is required."),
  type: z.enum(["Income", "Expense"], { message: "Choose a type." }),
  // No z.coerce here on purpose — combined with react-hook-form's `valueAsNumber: true` on
  // the input's register() call (see TransactionFormSheet), the value is already a number by
  // the time it reaches validation. z.coerce.number() would work too, but its input/output
  // types differ (unknown vs number), which fights react-hook-form's generic form-values type.
  amount: z.number({ message: "Enter an amount." }).positive("Amount must be greater than 0."),
  categoryId: z.string().min(1, "Choose or create a category."),
  notes: z.string().max(500, "Notes are too long.").optional(),
})

export type TransactionSchemaFormValues = z.infer<typeof transactionSchema>
