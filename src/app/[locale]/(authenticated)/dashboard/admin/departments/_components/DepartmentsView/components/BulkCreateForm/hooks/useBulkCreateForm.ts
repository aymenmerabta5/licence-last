"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import type { BulkDepartmentRow } from "@/lib/schemas/department"
import { bulkCreateDepartmentsSchema } from "@/lib/schemas/department"
import { orpc } from "@/server/orpc/client"

const DEPARTMENTS_LIST_QUERY_PATH = orpc.departments.list.queryOptions({
  input: { universityId: "__all__" },
}).queryKey[0]

const emptyRow = (): BulkDepartmentRow => ({
  departmentName: "",
  headEmail: "",
})

export function useBulkCreateForm(universityId: string | null) {
  const t = useTranslations("dashboard.admin.departments.bulkCreate")
  const queryClient = useQueryClient()

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

  const mutation = useMutation(
    orpc.departments.bulkCreateWithHeads.mutationOptions({
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
      onError: (error) => {
        toast.error(error.message || t("error"))
      },
    }),
  )

  const handleSubmit = useCallback(() => {
    if (!universityId) {
      toast.error(t("selectUniversityFirst"))
      return
    }

    const parsed = bulkCreateDepartmentsSchema.safeParse({ rows })
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
  }, [mutation, rows, t, universityId])

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
