// Shared with recurring-transactions — same enum, same category shape on the backend
// (Api.Dtos.CategoryRef / Api.Models.TransactionType).
export type TransactionType = "Income" | "Expense"

export interface ICategoryRef {
  id: string
  name: string
}

// Mirrors LedgrApi's TransactionResponse (Dtos/TransactionDtos.cs). date is a DateOnly
// string ("yyyy-MM-dd") — use lib/date.ts's parseDateOnly/formatDateOnly, not `new Date()`.
export interface ITransaction {
  id: string
  date: string
  type: TransactionType
  amount: number
  notes: string | null
  category: ICategoryRef
  userId: string
  createdAtUtc: string
  updatedAtUtc: string
}

export interface IBalance {
  balance: number
}

export interface ITransactionsQuery {
  page?: number
  pageSize?: number
  search?: string
  from?: string
  to?: string
}

// Mirrors LedgrApi's CreateTransactionRequest/UpdateTransactionRequest — same shape for
// both, matching the backend. date is a DateOnly string ("yyyy-MM-dd").
export interface ITransactionInput {
  date: string
  type: TransactionType
  amount: number
  categoryId: string
  notes?: string
}
