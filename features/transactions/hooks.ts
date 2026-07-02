import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import services from "./services"
import { ITransactionInput, ITransactionsQuery } from "./types"

export const useTransactionsQuery = (query: ITransactionsQuery = {}) => {
  return useQuery({
    queryKey: ["transactions", query],
    queryFn: () => services.getTransactions(query),
    placeholderData: keepPreviousData,
  })
}

export const useBalanceQuery = () => {
  return useQuery({
    queryKey: ["transactions", "balance"],
    queryFn: () => services.getBalance(),
  })
}

// invalidateQueries matches by key PREFIX — invalidating ["transactions"] here also catches
// ["transactions", "balance"] and every ["transactions", {page,...}] list variant, so one
// call keeps the dashboard's balance card and this page's list both in sync.
export const useCreateTransactionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ITransactionInput) => services.createTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    },
  })
}

export const useUpdateTransactionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ITransactionInput }) =>
      services.updateTransaction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    },
  })
}

export const useDeleteTransactionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => services.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    },
  })
}
