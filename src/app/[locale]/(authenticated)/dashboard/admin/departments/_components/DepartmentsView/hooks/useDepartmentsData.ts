"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import type { DepartmentItem } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/types"
import { orpc } from "@/server/orpc/client"

interface DepartmentUniversityOption {
  id: string
  name: string
}

interface FieldOption {
  id: string
  name: string
}

export function useDepartmentsData() {
  const { data: me, isLoading: isMeLoading } = useQuery(
    orpc.users.getMe.queryOptions(),
  )
  const isSuperAdmin = me?.user.role === "super_admin"

  const { data: universities, isLoading: isUniversitiesLoading } = useQuery({
    ...orpc.universities.list.queryOptions({
      input: { status: "approved", limit: 200 },
      enabled: isSuperAdmin,
    }),
  })

  const universityOptions = useMemo<DepartmentUniversityOption[]>(
    () =>
      (universities?.universities ?? []).map((uni) => ({
        id: uni.id,
        name: uni.name,
      })),
    [universities],
  )

  const [selectedUniversityId, setSelectedUniversityId] = useState("")

  useEffect(() => {
    if (isSuperAdmin) {
      if (universityOptions.length === 0) {
        if (selectedUniversityId) setSelectedUniversityId("")
        return
      }

      const selectedStillExists = universityOptions.some(
        (option) => option.id === selectedUniversityId,
      )

      if (!selectedUniversityId || !selectedStillExists) {
        const fallbackUniversityId = universityOptions[0]?.id ?? ""
        if (fallbackUniversityId !== selectedUniversityId) {
          setSelectedUniversityId(fallbackUniversityId)
        }
      }
      return
    }

    const ownUniversityId = me?.university?.id ?? ""
    if (ownUniversityId && ownUniversityId !== selectedUniversityId) {
      setSelectedUniversityId(ownUniversityId)
    }
  }, [
    isSuperAdmin,
    me?.university?.id,
    selectedUniversityId,
    universityOptions,
  ])

  const universityId = selectedUniversityId || null

  const {
    data,
    isLoading: isDepartmentsLoading,
    refetch,
  } = useQuery({
    ...orpc.departments.list.queryOptions({
      input: { universityId: universityId ?? "" },
      enabled: !!universityId,
    }),
  })

  const { data: fieldsResult } = useQuery(
    orpc.fields.list.queryOptions(),
  )

  const fields = useMemo<FieldOption[]>(() => fieldsResult?.fields ?? [], [fieldsResult])

  return {
    universityId,
    departments: (data ?? []) as DepartmentItem[],
    isLoading:
      isMeLoading ||
      (isSuperAdmin && isUniversitiesLoading) ||
      (Boolean(universityId) && isDepartmentsLoading),
    isSuperAdmin,
    universityOptions,
    selectedUniversityId,
    setSelectedUniversityId,
    refetch,
    fields,
  }
}
