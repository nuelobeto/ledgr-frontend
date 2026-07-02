import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import services from "./services"
import { ICategoriesQuery, ICategoryInput } from "./types"

export const useCategoriesQuery = (query: ICategoriesQuery = {}) => {
  return useQuery({
    queryKey: ["categories", query],
    queryFn: () => services.getCategories(query),
    // Keep showing the current page while the next one loads instead of flashing to a
    // skeleton — matters here specifically since paging/search/tab changes all refire this.
    placeholderData: keepPreviousData,
  })
}

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ICategoryInput) => services.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ICategoryInput }) =>
      services.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export const useArchiveCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => services.archiveCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export const useUnarchiveCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => services.unarchiveCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}
