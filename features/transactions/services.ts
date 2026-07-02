import axios from "axios"
import { IPagedResponse } from "@/lib/api-types"
import { IBalance, ITransaction, ITransactionInput, ITransactionsQuery } from "./types"

const getTransactions = async (query: ITransactionsQuery = {}) => {
  const { data } = await axios.get<IPagedResponse<ITransaction>>("/api/transactions", {
    params: query,
  })
  return data
}

const getBalance = async () => {
  const { data } = await axios.get<IBalance>("/api/transactions/balance")
  return data
}

const createTransaction = async (payload: ITransactionInput) => {
  const { data } = await axios.post<ITransaction>("/api/transactions/create", payload)
  return data
}

const updateTransaction = async (id: string, payload: ITransactionInput) => {
  const { data } = await axios.put<ITransaction>(`/api/transactions/${id}`, payload)
  return data
}

const deleteTransaction = async (id: string) => {
  await axios.delete(`/api/transactions/${id}`)
}

const services = {
  getTransactions,
  getBalance,
  createTransaction,
  updateTransaction,
  deleteTransaction,
}

export default services
