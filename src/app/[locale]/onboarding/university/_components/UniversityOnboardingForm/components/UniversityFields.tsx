"use client"

import { useTranslations } from "next-intl"
import { Landmark, User, Phone } from "lucide-react"
import { TextField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"
import type { UniversityOnboardingFormApi } from "../hooks/useUniversityOnboarding"

interface UniversityFieldsProps {
  form: UniversityOnboardingFormApi
}

export function UniversityFields({ form }: UniversityFieldsProps) {
  const t = useTranslations("onboarding.university")

  return (
    <>
      <form.Field name="name">
        {(field) => (
          <TextField
            id="university-name"
            label={t("name")}
            icon={Landmark}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("namePlaceholder")}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
          />
        )}
      </form.Field>

      <form.Field name="abbreviation">
        {(field) => (
          <TextField
            id="university-abbreviation"
            label={t("abbreviation")}
            icon={Landmark}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("abbreviationPlaceholder")}
          />
        )}
      </form.Field>

      <form.Field name="departmentName">
        {(field) => (
          <TextField
            id="university-department"
            label={t("departmentName")}
            icon={Landmark}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("departmentNamePlaceholder")}
          />
        )}
      </form.Field>

      <form.Field name="deanName">
        {(field) => (
          <TextField
            id="university-dean"
            label={t("deanName")}
            icon={User}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("deanNamePlaceholder")}
          />
        )}
      </form.Field>

      <form.Field name="phone">
        {(field) => (
          <TextField
            id="university-phone"
            label={t("phone")}
            icon={Phone}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("phonePlaceholder")}
          />
        )}
      </form.Field>
    </>
  )
}
