// Mirrors LedgrApi's PagedResponse<T> (Dtos/PagedResultDto.cs) — shared by every paginated
// list endpoint (transactions, recurring-transactions, categories, users, audit).
export interface IPagedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}
