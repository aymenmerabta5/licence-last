"use client"

import { useTranslations } from "next-intl"
import { Building2, FileText, Globe } from "lucide-react"
import { TextField, TextAreaField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"
import type { CompanyOnboardingFormApi } from "../hooks/useCompanyOnboarding"

interface CompanyFieldsProps {
  form: CompanyOnboardingFormApi
}

export function CompanyFields({ form }: CompanyFieldsProps) {
  const t = useTranslations("onboarding.company")

  return (
    <>
      <form.Field name="name">
        {(field) => (
          <TextField
            id="company-name"
            label={t("name")}
            icon={Building2}
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

      <form.Field name="description">
        {(field) => (
          <TextAreaField
            id="company-description"
            label={t("description")}
            icon={FileText}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("descriptionPlaceholder")}
            rows={3}
          />
        )}
      </form.Field>

      <form.Field name="websiteUrl">
        {(field) => (
          <TextField
            id="company-website"
            type="url"
            label={t("websiteUrl")}
            icon={Globe}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("websiteUrlPlaceholder")}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
          />
        )}
      </form.Field>
    </>
  )
}
