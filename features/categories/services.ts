import axios from "axios"
import { IPagedResponse } from "@/lib/api-types"
import { ICategoriesQuery, ICategory, ICategoryInput } from "./types"

const getCategories = async (query: ICategoriesQuery = {}) => {
  const { data } = await axios.get<IPagedResponse<ICategory>>("/api/categories", {
    params: query,
  })
  return data
}

const createCategory = async (payload: ICategoryInput) => {
  const { data } = await axios.post<ICategory>("/api/categories/create", payload)
  return data
}

const updateCategory = async (id: string, payload: ICategoryInput) => {
  const { data } = await axios.patch<ICategory>(`/api/categories/${id}`, payload)
  return data
}

// Archive/unarchive return 200+category normally, but 204 (no body) when the category was
// already in that state — CategoryController's idempotent no-op branch. Callers shouldn't
// rely on the response body; refetch the list instead (see useArchiveCategoryMutation).
const archiveCategory = async (id: string) => {
  await axios.post(`/api/categories/${id}/archive`)
}

const unarchiveCategory = async (id: string) => {
  await axios.post(`/api/categories/${id}/unarchive`)
}

const services = {
  getCategories,
  createCategory,
  updateCategory,
  archiveCategory,
  unarchiveCategory,
}

export default services
