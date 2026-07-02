import * as z from "zod"

// Mirrors LedgrApi's CreateRecurringTransactionRequest/UpdateRecurringTransactionRequest
// validation: [Required] Type/Amount/CategoryId/Frequency/NextDueDate,
// [Range(0.01, double.MaxValue)] Amount, [Range(1, int.MaxValue)] Interval, plus the
// controller's own `EndDate < NextDueDate` rejection (endDate >= nextDueDate here).
export const recurringTransactionSchema = z
  .object({
    type: z.enum(["Income", "Expense"], { message: "Choose a type." }),
    amount: z
      .number({ message: "Enter an amount." })
      .positive("Amount must be greater than 0."),
    categoryId: z.string().min(1, "Choose or create a category."),
    frequency: z.enum(["Daily", "Weekly", "Monthly", "Yearly"], {
      message: "Choose a frequency.",
    }),
    interval: z
      .number({ message: "Enter an interval." })
      .int("Interval must be a whole number.")
      .positive("Interval must be at least 1."),
    nextDueDate: z.string().min(1, "Next due date is required."),
    endDate: z.string().optional(),
    notes: z.string().max(500, "Notes are too long.").optional(),
  })
  .refine((data) => !data.endDate || data.endDate >= data.nextDueDate, {
    message: "End date must be on or after the next due date.",
    path: ["endDate"],
  })

export type RecurringTransactionSchemaFormValues = z.infer<typeof recurringTransactionSchema>
