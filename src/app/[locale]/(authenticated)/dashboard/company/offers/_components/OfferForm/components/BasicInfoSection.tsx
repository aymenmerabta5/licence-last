"use client"

import { useTranslations } from "next-intl"
import { FileText, Briefcase } from "lucide-react"

import { errorMessage } from "@/lib/schemas/auth"
import { TextField, TextAreaField, FormSection } from "@/components/form-fields"

interface BasicInfoSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  const t = useTranslations("dashboard.company.offers.form")

  return (
    <FormSection title={t("basicInfo")} delay={0.1}>
      {/* Title */}
      <form.Field name="title">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
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
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
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
