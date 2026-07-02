import axios from "axios"
import { IPagedResponse } from "@/lib/api-types"
import {
  IRecurringTransaction,
  IRecurringTransactionInput,
  IRecurringTransactionsQuery,
  IUpdateRecurringTransactionInput,
} from "./types"

const getRecurringTransactions = async (query: IRecurringTransactionsQuery = {}) => {
  const { data } = await axios.get<IPagedResponse<IRecurringTransaction>>(
    "/api/recurring-transactions",
    { params: query }
  )
  return data
}

const createRecurringTransaction = async (payload: IRecurringTransactionInput) => {
  const { data } = await axios.post<IRecurringTransaction>(
    "/api/recurring-transactions/create",
    payload
  )
  return data
}

const updateRecurringTransaction = async (
  id: string,
  payload: IUpdateRecurringTransactionInput
) => {
  const { data } = await axios.put<IRecurringTransaction>(
    `/api/recurring-transactions/${id}`,
    payload
  )
  return data
}

const deleteRecurringTransaction = async (id: string) => {
  await axios.delete(`/api/recurring-transactions/${id}`)
}

// pause/resume return 200+item normally, or the same shape unchanged when already in that
// state (idempotent no-op on the backend) — callers refetch the list either way, see hooks.ts.
const pauseRecurringTransaction = async (id: string) => {
  await axios.post(`/api/recurring-transactions/${id}/pause`)
}

const resumeRecurringTransaction = async (id: string) => {
  await axios.post(`/api/recurring-transactions/${id}/resume`)
}

const services = {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  pauseRecurringTransaction,
  resumeRecurringTransaction,
}

export default services
