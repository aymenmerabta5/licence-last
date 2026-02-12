"use client"

import { useMemo, useState } from "react"
import * as motion from "motion/react-client"
import { useForm } from "@tanstack/react-form"
import {
  FileText,
  Globe,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { SelectField, TextAreaField, TextField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ServerError } from "@/components/ServerError"
import { SuccessMessage } from "@/components/SuccessMessage"
import { errorMessage } from "@/lib/schemas/auth"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { getErrorMessage } from "@/lib/error-message"
import { reveal, ease } from "@/lib/animations"
import { createCompanyProfileSchema } from "@/lib/schemas/offer"
import { WILAYA_OPTIONS } from "@/lib/wilayas"
import { orpcClient } from "@/server/orpc/client"

interface CompanyProfileFormProps {
  initialData: {
    description: string
    logoUrl: string
    websiteUrl: string
    phone: string
    contactEmail: string
    representativeName: string
    wilayaCode: number
    address: string
  }
}

export function CompanyProfileForm({ initialData }: CompanyProfileFormProps) {
  const t = useTranslations("dashboard.company.profile")
  const tv = useTranslations("auth.validation")

  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl)
  const [isUploading, setIsUploading] = useState(false)

  const schema = useMemo(() => createCompanyProfileSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      description: initialData.description,
      logoUrl: initialData.logoUrl,
      websiteUrl: initialData.websiteUrl,
      phone: initialData.phone,
      contactEmail: initialData.contactEmail,
      representativeName: initialData.representativeName,
      wilayaCode: initialData.wilayaCode,
      address: initialData.address,
    },
    validators: {
      onSubmit: ({ value }) => mapZodErrors(schema.safeParse(value)),
    },
    onSubmit: async ({ value }) => {
      setServerError("")
      setSuccessMessage("")

      try {
        await orpcClient.companies.update({
          description: value.description || undefined,
          logoUrl: value.logoUrl || undefined,
          websiteUrl: value.websiteUrl || undefined,
          phone: value.phone || undefined,
          contactEmail: value.contactEmail || undefined,
          representativeName: value.representativeName || undefined,
          wilayaCode: value.wilayaCode || undefined,
          address: value.address || undefined,
        })

        setSuccessMessage(t("success"))
      } catch (err) {
        setServerError(getErrorMessage(err, t("error")))
      }
    },
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setServerError("")

    try {
      const result = await orpcClient.companies.uploadLogo({ file })
      setLogoUrl(result.url)
      form.setFieldValue("logoUrl", result.url)
    } catch (err) {
      setServerError(getErrorMessage(err, t("error")))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-7"
    >
      <ServerError message={serverError} />
      <SuccessMessage message={successMessage} />

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="space-y-3"
      >
        <Label className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground">
          {t("logo")}
        </Label>
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Company logo"
                className="h-16 w-16 rounded-lg object-cover border border-border"
              />
            </>
          ) : (
            <div className="h-16 w-16 rounded-lg border border-dashed border-border flex items-center justify-center">
              <ImagePlus className="h-6 w-6 text-muted-foreground/40" />
            </div>
          )}
          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border hover:border-primary/30 hover:text-primary transition-colors cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("logoUploading")}
                </>
              ) : (
                <>
                  <ImagePlus className="h-3.5 w-3.5" />
                  {t("logoUpload")}
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={isUploading}
              />
            </label>
            <p className="text-[10px] text-muted-foreground mt-1">{t("logoHint")}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="space-y-5"
      >
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
              rows={4}
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

        <form.Field name="phone">
          {(field) => (
            <TextField
              id="company-phone"
              type="tel"
              label={t("phone")}
              icon={Phone}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder={t("phonePlaceholder")}
            />
          )}
        </form.Field>

        <form.Field name="contactEmail">
          {(field) => (
            <TextField
              id="company-contact-email"
              type="email"
              label={t("contactEmail")}
              icon={Mail}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder={t("contactEmailPlaceholder")}
              error={
                field.state.meta.errors.length > 0
                  ? errorMessage(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        <form.Field name="representativeName">
          {(field) => (
            <TextField
              id="company-rep-name"
              label={t("representativeName")}
              icon={User}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder={t("representativeNamePlaceholder")}
            />
          )}
        </form.Field>

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
      </motion.div>

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.2 }}
      >
        <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
          {([isSubmitting]) => (
            <Button
              type="submit"
              variant="editorial"
              size="editorial"
              className="w-full h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("submit")}
            </Button>
          )}
        </form.Subscribe>
      </motion.div>
    </form>
  )
}
