"use client"

import { useTranslations } from "next-intl"
import { Clock, Users } from "lucide-react"

import { errorMessage } from "@/lib/schemas/auth"
import { TextField } from "@/components/form-fields"

interface DetailsCapacityFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFieldError(field: any): string | undefined {
  return field.state.meta.errors.length > 0
    ? errorMessage(field.state.meta.errors[0])
    : undefined
}

export function DetailsCapacityFields({ form }: DetailsCapacityFieldsProps) {
  const t = useTranslations("dashboard.company.offers.form")

  return (
    <>
      <form.Field name="durationWeeks">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
          <TextField
            id="offer-duration"
            label={t("durationWeeks")}
            icon={Clock}
            type="number"
            value={String(field.state.value || "")}
            onChange={(value) => field.handleChange(Number(value))}
            onBlur={field.handleBlur}
            placeholder={t("durationWeeksPlaceholder")}
            error={getFieldError(field)}
          />
        )}
      </form.Field>

      <form.Field name="maxPositions">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
          <TextField
            id="offer-positions"
            label={t("maxPositions")}
            icon={Users}
            type="number"
            value={String(field.state.value || "")}
            onChange={(value) => field.handleChange(Number(value))}
            onBlur={field.handleBlur}
            placeholder={t("maxPositionsPlaceholder")}
            error={getFieldError(field)}
          />
        )}
      </form.Field>
    </>
  )
}
