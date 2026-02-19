"use client"

import { MapPin } from "lucide-react"
import { useTranslations } from "next-intl"
import type { UniversityOnboardingFormApi } from "@/app/[locale]/onboarding/university/_components/UniversityOnboardingForm/hooks/useUniversityOnboarding"
import { SelectField, TextField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"
import { WILAYA_OPTIONS } from "@/lib/wilayas"

interface LocationFieldsProps {
  form: UniversityOnboardingFormApi
}

export function LocationFields({ form }: LocationFieldsProps) {
  const t = useTranslations("onboarding.university")

  return (
    <>
      <form.Field name="wilayaCode">
        {(field) => (
          <SelectField
            id="university-wilaya"
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

      <form.Field name="city">
        {(field) => (
          <TextField
            id="university-city"
            label={t("city")}
            icon={MapPin}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("cityPlaceholder")}
          />
        )}
      </form.Field>

      <form.Field name="address">
        {(field) => (
          <TextField
            id="university-address"
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
