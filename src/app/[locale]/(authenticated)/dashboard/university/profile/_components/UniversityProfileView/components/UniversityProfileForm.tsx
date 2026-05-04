"use client"

import { Building2, Loader2, MapPin, Phone, Save } from "lucide-react"
import { useTranslations } from "next-intl"
import { LogoUploadSection } from "@/app/[locale]/(authenticated)/dashboard/university/profile/_components/UniversityProfileView/components/LogoUploadSection"
import { useUniversityProfileForm } from "@/app/[locale]/(authenticated)/dashboard/university/profile/_components/UniversityProfileView/hooks/useUniversityProfileForm"
import { TextField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import { errorMessage } from "@/lib/schemas/auth"
import type { university } from "@/server/db/schema/universities"

type University = typeof university.$inferSelect

interface UniversityProfileFormProps {
  university: University | null
  onSubmit: (values: {
    name?: string
    abbreviation?: string | null
    phone?: string | null
    wilayaCode?: number | null
    city?: string | null
    address?: string | null
    logoUrl?: string | null
  }) => void
  onLogoUploadSuccess?: () => void
  isUpdating: boolean
}

export function UniversityProfileForm({
  university,
  onSubmit,
  onLogoUploadSuccess,
  isUpdating,
}: UniversityProfileFormProps) {
  const t = useTranslations("dashboard.universityProfile")
  const { form, isLogoUploading, handleLogoUpload } = useUniversityProfileForm({
    university,
    onSubmit,
    onLogoUploadSuccess,
  })

  const getError = (errors: unknown[]) =>
    errors.length > 0 ? errorMessage(errors[0]) : undefined

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      <form.Field name="logoUrl">
        {(field) => (
          <LogoUploadSection
            logoUrl={field.state.value}
            isUploading={isLogoUploading}
            onUpload={handleLogoUpload}
          />
        )}
      </form.Field>

      <form.Field name="name">
        {(field) => (
          <TextField
            id="university-name"
            label={t("name")}
            icon={Building2}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("namePlaceholder")}
            error={getError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <form.Field name="abbreviation">
          {(field) => (
            <TextField
              id="university-abbreviation"
              label={t("abbreviation")}
              icon={Building2}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder={t("abbreviationPlaceholder")}
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <form.Field name="wilayaCode">
          {(field) => (
            <TextField
              id="university-wilaya"
              label={t("wilayaCode")}
              icon={MapPin}
              type="number"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder={t("wilayaPlaceholder")}
              min="1"
              max="58"
              error={getError(field.state.meta.errors)}
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
      </div>

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

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="editorial"
          size="editorial-sm"
          disabled={isUpdating}
          className="gap-2"
        >
          {isUpdating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {t("saveProfile")}
        </Button>
      </div>
    </form>
  )
}
