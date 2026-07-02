import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import services from "./services"
import {
  IRecurringTransactionInput,
  IRecurringTransactionsQuery,
  IUpdateRecurringTransactionInput,
} from "./types"

export const useRecurringTransactionsQuery = (query: IRecurringTransactionsQuery = {}) => {
  return useQuery({
    queryKey: ["recurring-transactions", query],
    queryFn: () => services.getRecurringTransactions(query),
    placeholderData: keepPreviousData,
  })
}

// invalidateQueries matches by key PREFIX — invalidating ["recurring-transactions"] here also
// catches the dashboard's ["recurring-transactions", {isActive:true,...}] widget query.
export const useCreateRecurringTransactionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: IRecurringTransactionInput) =>
      services.createRecurringTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] })
    },
  })
}

export const useUpdateRecurringTransactionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IUpdateRecurringTransactionInput }) =>
      services.updateRecurringTransaction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] })
    },
  })
}

export const useDeleteRecurringTransactionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => services.deleteRecurringTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] })
    },
  })
}

export const usePauseRecurringTransactionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => services.pauseRecurringTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] })
    },
  })
}

export const useResumeRecurringTransactionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => services.resumeRecurringTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] })
    },
  })
}
