// Mirrors LedgrApi's CategoryResponse (Dtos/CategoryDtos.cs).
export interface ICategory {
  id: string
  name: string
  userId: string
  isArchived: boolean
  createdAtUtc: string
  updatedAtUtc: string
}

export interface ICategoriesQuery {
  page?: number
  pageSize?: number
  search?: string
  archived?: boolean
}

export interface ICategoryInput {
  name: string
}
