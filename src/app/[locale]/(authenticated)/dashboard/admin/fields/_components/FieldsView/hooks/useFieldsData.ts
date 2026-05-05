"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { orpc } from "@/server/orpc/client"

export function useFieldsData() {
  const { data, isLoading, refetch } = useQuery(
    orpc.fields.list.queryOptions(),
  )

  const fields = useMemo(() => data?.fields ?? [], [data])

  return { fields, isLoading, refetch }
}
