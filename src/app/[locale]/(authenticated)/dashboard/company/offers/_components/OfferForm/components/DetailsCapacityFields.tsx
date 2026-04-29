"use client"

import { Clock, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import type { OfferFormApi } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/hooks/useOfferForm"
import { TextField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"

interface DetailsCapacityFieldsProps {
  form: OfferFormApi
}

function getFieldError(field: {
  state: { meta: { errors: unknown[] } }
}): string | undefined {
  return field.state.meta.errors.length > 0
    ? errorMessage(field.state.meta.errors[0])
    : undefined
}

export function DetailsCapacityFields({ form }: DetailsCapacityFieldsProps) {
  const t = useTranslations("dashboard.company.offers.form")

  return (
    <>
      <form.Field name="durationWeeks">
        {(field) => (
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
        {(field) => (
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
