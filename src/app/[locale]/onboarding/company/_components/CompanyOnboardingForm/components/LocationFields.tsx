"use client"

import { useTranslations } from "next-intl"
import { MapPin } from "lucide-react"
import { SelectField, TextField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"
import { WILAYA_OPTIONS } from "@/lib/wilayas"
import type { CompanyOnboardingFormApi } from "../hooks/useCompanyOnboarding"

interface LocationFieldsProps {
  form: CompanyOnboardingFormApi
}

export function LocationFields({ form }: LocationFieldsProps) {
  const t = useTranslations("onboarding.company")

  return (
    <>
      <form.Field name="wilayaCode">
        {(field) => (
          <SelectField
            id="company-wilaya"
            label={t("wilaya")}
            icon={MapPin}
            value={field.state.value}
            onChange={(value) => field.handleChange(Number(value))}
            onBlur={field.handleBlur}
            placeholder={t("wilayaPlaceholder")}
            options={WILAYA_OPTIONS}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
          />
        )}
      </form.Field>

      <form.Field name="address">
        {(field) => (
          <TextField
            id="company-address"
            label={t("address")}
            icon={MapPin}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("addressPlaceholder")}
          />
        )}
      </form.Field>
    </>
  )
}
