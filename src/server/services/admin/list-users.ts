import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

interface ListUsersParams {
  limit?: number
  offset?: number
  searchValue?: string
  searchField?: "email" | "name"
  searchOperator?: "contains" | "starts_with" | "ends_with"
  sortBy?: string
  sortDirection?: "asc" | "desc"
  filterField?: string
  filterValue?: string | number | boolean
  filterOperator?: "eq" | "ne" | "lt" | "lte" | "gt" | "gte"
}

const getAuthApi = () => (globalThis as any).__authApi ?? auth.api
type ListUsersDeps = { authApi?: typeof auth.api; getHeaders?: typeof headers }

export async function listUsers(params: ListUsersParams, deps: ListUsersDeps = {}) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const result = await api.listUsers({
    headers: await getHeaders(),
    query: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      ...(params.searchValue && {
        searchValue: params.searchValue,
        searchField: params.searchField ?? "email",
        searchOperator: params.searchOperator ?? "contains",
      }),
      ...(params.sortBy && {
        sortBy: params.sortBy,
        sortDirection: params.sortDirection ?? "asc",
      }),
      ...(params.filterField && {
        filterField: params.filterField,
        filterValue: params.filterValue,
        filterOperator: params.filterOperator ?? "eq",
      }),
    },
  })

  return result
}
