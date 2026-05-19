"use client"

import { Briefcase, MapPin } from "lucide-react"
import { useTranslations } from "next-intl"
import type { OfferFormApi } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/hooks/useOfferForm"
import type {
  InternshipType,
  WorkMode,
} from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/types"
import { SelectField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"
import { WILAYAS } from "@/lib/wilayas"

interface DetailsTypeLocationFieldsProps {
  form: OfferFormApi
}

const INTERNSHIP_TYPE_OPTIONS = [
  { value: "pfe", label: "PFE" },
  { value: "immersion", label: "Immersion" },
  { value: "summer", label: "Summer" },
  { value: "practical", label: "Practical" },
]

const WORK_MODE_OPTIONS = [
  { value: "on_site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
]

const WILAYA_OPTIONS = WILAYAS.map((name, index) => ({
  value: index + 1,
  label: `${String(index + 1).padStart(2, "0")} - ${name}`,
}))

function getFieldError(field: {
  state: { meta: { errors: unknown[] } }
}): string | undefined {
  return field.state.meta.errors.length > 0
    ? errorMessage(field.state.meta.errors[0])
    : undefined
}

export function DetailsTypeLocationFields({
  form,
}: DetailsTypeLocationFieldsProps) {
  const t = useTranslations("dashboard.company.offers.form")

  return (
    <>
      <form.Field name="internshipType">
        {(field) => (
          <SelectField
            id="offer-type"
            label={t("internshipType")}
            icon={Briefcase}
            placeholder={t("internshipTypePlaceholder")}
            options={INTERNSHIP_TYPE_OPTIONS}
            value={field.state.value}
            onChange={(value) =>
              field.handleChange(value as InternshipType | "")
            }
            onBlur={field.handleBlur}
            error={getFieldError(field)}
          />
        )}
      </form.Field>

      <form.Field name="workMode">
        {(field) => (
          <SelectField
            id="offer-work-mode"
            label={t("workMode")}
            icon={MapPin}
            placeholder={t("workModePlaceholder")}
            options={WORK_MODE_OPTIONS}
            value={field.state.value}
            onChange={(value) => field.handleChange(value as WorkMode | "")}
            onBlur={field.handleBlur}
            error={getFieldError(field)}
          />
        )}
      </form.Field>

      <form.Field name="wilayaCode">
        {(field) => (
          <SelectField
            id="offer-wilaya"
            label={t("wilaya")}
            icon={MapPin}
            placeholder={t("wilayaPlaceholder")}
            options={WILAYA_OPTIONS}
            value={field.state.value}
            onChange={(value) => field.handleChange(Number(value))}
            onBlur={field.handleBlur}
            error={getFieldError(field)}
          />
        )}
      </form.Field>
    </>
  )
}
