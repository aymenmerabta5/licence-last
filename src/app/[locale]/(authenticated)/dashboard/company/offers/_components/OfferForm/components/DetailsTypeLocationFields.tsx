"use client"

import { useTranslations } from "next-intl"
import { Briefcase, MapPin } from "lucide-react"

import { errorMessage } from "@/lib/schemas/auth"
import { WILAYAS } from "@/lib/wilayas"
import { SelectField } from "@/components/form-fields"

interface DetailsTypeLocationFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFieldError(field: any): string | undefined {
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
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
          <SelectField
            id="offer-type"
            label={t("internshipType")}
            icon={Briefcase}
            placeholder={t("internshipTypePlaceholder")}
            options={INTERNSHIP_TYPE_OPTIONS}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={getFieldError(field)}
          />
        )}
      </form.Field>

      <form.Field name="workMode">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
          <SelectField
            id="offer-work-mode"
            label={t("workMode")}
            icon={MapPin}
            placeholder={t("workModePlaceholder")}
            options={WORK_MODE_OPTIONS}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <form.Field name="wilayaCode">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
          <SelectField
            id="offer-wilaya"
            label={t("wilaya")}
            icon={MapPin}
            placeholder={t("wilayaPlaceholder")}
            options={WILAYA_OPTIONS}
            value={field.state.value}
            onChange={(value) => field.handleChange(Number(value))}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>
    </>
  )
}
