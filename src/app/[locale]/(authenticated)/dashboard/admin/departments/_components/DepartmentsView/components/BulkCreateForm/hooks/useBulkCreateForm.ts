"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { resolveLocalizedError } from "@/lib/error-message"
import type { BulkDepartmentRow } from "@/lib/schemas/department"
import { createBulkCreateDepartmentsSchema } from "@/lib/schemas/department"
import { orpc } from "@/server/orpc/client"

const DEPARTMENTS_LIST_QUERY_PATH = orpc.departments.list.queryOptions({
  input: { universityId: "__all__" },
}).queryKey[0]

const emptyRow = (): BulkDepartmentRow => ({
  departmentName: "",
  headEmail: "",
})

export function useBulkCreateForm(universityId: string | null) {
  const tr = useTranslations()
  const t = useTranslations("dashboard.admin.departments.bulkCreate")
  const tv = useTranslations("auth.validation")
  const queryClient = useQueryClient()

  const listQueryOptions = useMemo(
    () =>
      orpc.departments.list.queryOptions({
        input: { universityId: universityId ?? "" },
      }),
    [universityId],
  )

  const [rows, setRows] = useState<BulkDepartmentRow[]>([emptyRow()])
  const [fieldErrors, setFieldErrors] = useState<
    Array<Partial<Record<keyof BulkDepartmentRow, string>>>
  >([{}])

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, emptyRow()])
    setFieldErrors((prev) => [...prev, {}])
  }, [])

  const removeRow = useCallback((index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
    setFieldErrors((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateRow = useCallback(
    (index: number, field: keyof BulkDepartmentRow, value: string) => {
      setRows((prev) =>
        prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
      )
      // Clear field error on edit
      setFieldErrors((prev) =>
        prev.map((errs, i) =>
          i === index ? { ...errs, [field]: undefined } : errs,
        ),
      )
    },
    [],
  )

  const mutation = useMutation({
    ...orpc.departments.bulkCreateWithHeads.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: listQueryOptions.queryKey })
      const previousData = queryClient.getQueryData(listQueryOptions.queryKey)
      queryClient.setQueryData(listQueryOptions.queryKey, (old) => {
        if (!old) return old
        const newDepartments = variables.rows.map((row, i) => ({
          id: `optimistic-${Date.now()}-${i}`,
          name: row.departmentName,
          headUserId: null,
          headUserName: null,
          headUserEmail: row.headEmail || null,
          skillCount: 0,
          createdAt: new Date(),
          fieldName: null,
        }))
        return [...old, ...newDepartments]
      })
      return { previousData }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [DEPARTMENTS_LIST_QUERY_PATH],
      })

      if (data.errors.length === 0) {
        toast.success(t("successMessage", { count: data.created.length }))
        setRows([emptyRow()])
        setFieldErrors([{}])
      } else if (data.created.length > 0) {
        toast.warning(
          t("partialSuccess", {
            created: data.created.length,
            failed: data.errors.length,
          }),
        )
        // Show individual errors
        for (const err of data.errors) {
          toast.error(
            t("rowError", { name: err.departmentName, error: err.message }),
          )
        }
        setRows([emptyRow()])
        setFieldErrors([{}])
      } else {
        for (const err of data.errors) {
          toast.error(
            t("rowError", { name: err.departmentName, error: err.message }),
          )
        }
      }
    },
    onError: (error, _variables, context) => {
      toast.error(
        resolveLocalizedError(error, {
          t: tr,
          fallbackKey: "dashboard.admin.departments.bulkCreate.error",
        }),
      )
      if (context?.previousData) {
        queryClient.setQueryData(
          listQueryOptions.queryKey,
          context.previousData,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listQueryOptions.queryKey })
    },
  })

  const handleSubmit = useCallback(() => {
    if (!universityId) {
      toast.error(t("selectUniversityFirst"))
      return
    }

    const parsed = createBulkCreateDepartmentsSchema(tv).safeParse({ rows })
    if (!parsed.success) {
      // Map Zod errors to per-field errors
      const newFieldErrors: Array<
        Partial<Record<keyof BulkDepartmentRow, string>>
      > = rows.map(() => ({}))

      for (const issue of parsed.error.issues) {
        // Path like ["rows", 0, "headEmail"]
        if (issue.path[0] === "rows" && typeof issue.path[1] === "number") {
          const idx = issue.path[1]
          const field = issue.path[2] as keyof BulkDepartmentRow | undefined
          if (field && newFieldErrors[idx]) {
            newFieldErrors[idx][field] = issue.message
          }
        }
      }
      setFieldErrors(newFieldErrors)
      return
    }

    setFieldErrors(rows.map(() => ({})))
    mutation.mutate({ ...parsed.data, universityId })
  }, [mutation, rows, t, tv, universityId])

  return {
    rows,
    fieldErrors,
    addRow,
    removeRow,
    updateRow,
    handleSubmit,
    canSubmit: Boolean(universityId),
    isPending: mutation.isPending,
  }
}
