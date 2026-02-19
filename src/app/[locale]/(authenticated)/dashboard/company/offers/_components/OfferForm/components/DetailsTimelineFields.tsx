"use client"

import { Calendar } from "lucide-react"
import { useTranslations } from "next-intl"
import { TextField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"

interface DetailsTimelineFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFieldError(field: any): string | undefined {
  return field.state.meta.errors.length > 0
    ? errorMessage(field.state.meta.errors[0])
    : undefined
}

export function DetailsTimelineFields({ form }: DetailsTimelineFieldsProps) {
  const t = useTranslations("dashboard.company.offers.form")
  const today = new Date().toISOString().split("T")[0]

  return (
    <>
      <form.Field name="applicationDeadlineAt">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
          <TextField
            id="offer-application-deadline"
            label={t("applicationDeadline")}
            icon={Calendar}
            type="date"
            value={field.state.value || ""}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            min={today}
            max={form.state.values.expectedStartDate || undefined}
            error={getFieldError(field)}
          />
        )}
      </form.Field>

      <form.Field name="expectedStartDate">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
          <TextField
            id="offer-expected-start-date"
            label={t("expectedStartDate")}
            icon={Calendar}
            type="date"
            value={field.state.value || ""}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            min={today}
            error={getFieldError(field)}
          />
        )}
      </form.Field>

      <form.Field name="expectedEndDate">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
          <TextField
            id="offer-expected-end-date"
            label={t("expectedEndDate")}
            icon={Calendar}
            type="date"
            value={field.state.value || ""}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            min={form.state.values.expectedStartDate || today}
            error={getFieldError(field)}
          />
        )}
      </form.Field>
    </>
  )
}
