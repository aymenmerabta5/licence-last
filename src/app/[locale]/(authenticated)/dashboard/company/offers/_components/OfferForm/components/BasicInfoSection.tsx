"use client"

import { Briefcase, FileText } from "lucide-react"
import { useTranslations } from "next-intl"
import type { OfferFormApi } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/hooks/useOfferForm"
import { FormSection, TextAreaField, TextField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"

interface BasicInfoSectionProps {
  form: OfferFormApi
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  const t = useTranslations("dashboard.company.offers.form")

  return (
    <FormSection title={t("basicInfo")} delay={0.1}>
      {/* Title */}
      <form.Field name="title">
        {(field) => (
          <TextField
            id="offer-title"
            label={t("title")}
            icon={Briefcase}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("titlePlaceholder")}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
          />
        )}
      </form.Field>

      {/* Description */}
      <form.Field name="description">
        {(field) => (
          <TextAreaField
            id="offer-description"
            label={t("description")}
            icon={FileText}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("descriptionPlaceholder")}
            rows={5}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
          />
        )}
      </form.Field>
    </FormSection>
  )
}
