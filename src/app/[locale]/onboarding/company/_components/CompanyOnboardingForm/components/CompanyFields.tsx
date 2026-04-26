"use client"

import { Building2, FileBadge2, FileText, Globe } from "lucide-react"
import { useTranslations } from "next-intl"
import type { CompanyOnboardingFormApi } from "@/app/[locale]/onboarding/company/_components/CompanyOnboardingForm/hooks/useCompanyOnboarding"
import { TextAreaField, TextField } from "@/components/form-fields"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { errorMessage } from "@/lib/schemas/auth"

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

      <form.Field name="verificationDocument">
        {(field) => (
          <div className="space-y-2">
            <Label
              htmlFor="company-verification-document"
              className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
            >
              {t("verificationDocument")}
            </Label>
            <div className="relative">
              <FileBadge2 className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="company-verification-document"
                type="file"
                className="h-11 rounded-none ps-10 file:me-3 file:rounded-none file:border-0 file:bg-muted file:px-3 file:py-2 file:text-xs file:font-medium"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(event) =>
                  field.handleChange(event.target.files?.[0] ?? null)
                }
                onBlur={field.handleBlur}
              />
            </div>
            <p className="text-[10px] text-muted-foreground/70">
              {t("verificationDocumentHint")}
            </p>
            {field.state.value ? (
              <p className="text-[11px] text-heading font-medium">
                {t("verificationDocumentSelected", {
                  fileName: field.state.value.name,
                })}
              </p>
            ) : null}
            {field.state.meta.errors.length > 0 ? (
              <p
                className="text-destructive text-[11px] tracking-wide"
                role="alert"
              >
                {errorMessage(field.state.meta.errors[0])}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>
    </>
  )
}
