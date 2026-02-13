"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"
import { useDebounce } from "@/hooks"

export function useUserManagement() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [page, setPage] = useState(0)
  const limit = 20
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, refetch } = useQuery(
    orpc.adminUsers.list.queryOptions({
      input: {
        limit,
        offset: page * limit,
        ...(debouncedSearch && {
          searchValue: debouncedSearch,
          searchField: "email" as const,
          searchOperator: "contains" as const,
        }),
        ...(roleFilter !== "all" && {
          filterField: "role",
          filterValue: roleFilter,
          filterOperator: "eq" as const,
        }),
        sortBy: "createdAt",
        sortDirection: "desc" as const,
      },
    }),
  )

  const users = data?.users ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  return {
    users,
    total,
    isLoading,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    page,
    setPage,
    totalPages,
    refetch,
  }
}
