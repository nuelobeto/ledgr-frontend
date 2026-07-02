import { ICategoryRef, TransactionType } from "@/features/transactions/types"

export type Frequency = "Daily" | "Weekly" | "Monthly" | "Yearly"

// Mirrors LedgrApi's RecurringTransactionResponse (Dtos/RecurringTransactionDtos.cs).
// nextDueDate/endDate are DateOnly strings — see lib/date.ts.
export interface IRecurringTransaction {
  id: string
  type: TransactionType
  amount: number
  notes: string | null
  category: ICategoryRef
  frequency: Frequency
  interval: number
  nextDueDate: string
  endDate: string | null
  isActive: boolean
  userId: string
  createdAtUtc: string
  updatedAtUtc: string
}

export interface IRecurringTransactionsQuery {
  page?: number
  pageSize?: number
  search?: string
  isActive?: boolean
}

// Mirrors LedgrApi's CreateRecurringTransactionRequest. UpdateRecurringTransactionRequest is
// the same shape plus a required isActive — see IUpdateRecurringTransactionInput.
export interface IRecurringTransactionInput {
  type: TransactionType
  amount: number
  categoryId: string
  frequency: Frequency
  interval: number
  nextDueDate: string
  endDate?: string
  notes?: string
}

export interface IUpdateRecurringTransactionInput extends IRecurringTransactionInput {
  isActive: boolean
}
