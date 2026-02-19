"use client"

import { useMutation } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { companyReportSchema } from "@/lib/schemas/company"
import type { CompanyReportSeverity } from "@/lib/schemas/enums"
import { orpc } from "@/server/orpc/client"

const DEFAULT_FORM_VALUES = {
  category: "professional_conduct",
  severity: "medium" as CompanyReportSeverity,
  description: "",
}

export interface CompanyReportFormValues {
  category: string
  severity: CompanyReportSeverity
  description: string
}

export interface CompanyReportFormErrors {
  category?: string
  severity?: string
  description?: string
}

export interface UseCompanyReportResult {
  isOpen: boolean
  values: CompanyReportFormValues
  errors: CompanyReportFormErrors
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  setFieldValue: <K extends keyof CompanyReportFormValues>(
    field: K,
    value: CompanyReportFormValues[K],
  ) => void
  submitReport: () => void
}

function extractErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = error.message
    if (typeof message === "string" && message.length > 0) {
      return message
    }
  }

  return fallback
}

function mapValidationErrors(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>
}): CompanyReportFormErrors {
  const fieldErrors: CompanyReportFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (field === "category" && !fieldErrors.category) {
      fieldErrors.category = issue.message
    }

    if (field === "severity" && !fieldErrors.severity) {
      fieldErrors.severity = issue.message
    }

    if (field === "description" && !fieldErrors.description) {
      fieldErrors.description = issue.message
    }
  }

  return fieldErrors
}

export function useCompanyReport(companyId: string): UseCompanyReportResult {
  const t = useTranslations("dashboard.offerDetail.report")

  const [isOpen, setIsOpen] = useState(false)
  const [values, setValues] =
    useState<CompanyReportFormValues>(DEFAULT_FORM_VALUES)
  const [errors, setErrors] = useState<CompanyReportFormErrors>({})

  const reportMutation = useMutation(
    orpc.companies.submitReport.mutationOptions({
      onSuccess: () => {
        toast.success(t("submitSuccess"))
        setValues(DEFAULT_FORM_VALUES)
        setErrors({})
        setIsOpen(false)
      },
      onError: (error) => {
        toast.error(extractErrorMessage(error, t("submitError")))
      },
    }),
  )

  function setFieldValue<K extends keyof CompanyReportFormValues>(
    field: K,
    value: CompanyReportFormValues[K],
  ) {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !reportMutation.isPending) {
      setValues(DEFAULT_FORM_VALUES)
      setErrors({})
    }

    setIsOpen(nextOpen)
  }

  function submitReport() {
    const parsed = companyReportSchema.safeParse({
      companyId,
      category: values.category.trim(),
      severity: values.severity,
      description: values.description.trim(),
    })

    if (!parsed.success) {
      setErrors(mapValidationErrors(parsed.error))
      return
    }

    reportMutation.mutate(parsed.data)
  }

  return {
    isOpen,
    values,
    errors,
    isSubmitting: reportMutation.isPending,
    onOpenChange: handleOpenChange,
    setFieldValue,
    submitReport,
  }
}
